# ランドリーの写真を、みんちりえの背景に近い絵の雰囲気に加工する（段階2の試作）
# 1. 16:9 に切り出す（右下のカメラの透かしは入れない）
# 2. 貼り紙・メモ・商品のロゴを消す（周りの色で埋める）
# 3. 細部をならして絵っぽくし、色味をやわらげる
# 使い方（omoikomi/ で）: uv run --with opencv-python-headless --with numpy python tools/stylize_photo.py <写真> <出力フォルダ>
import sys, os
import cv2
import numpy as np

src, out_dir = sys.argv[1], sys.argv[2]
os.makedirs(out_dir, exist_ok=True)
img = cv2.imread(src)
img = cv2.resize(img, (2000, 1500), interpolation=cv2.INTER_AREA)  # 座標はこの大きさで書いている

# 消す場所（2000x1500 に縮めた写真の座標。x1, y1, x2, y2）
ERASE = [
    (375, 465, 565, 935),     # 左の壁の貼り紙
    (1415, 515, 1535, 705),   # 右の壁の貼り紙
    (1435, 405, 1605, 495),   # 右の壁のメモ
    (1625, 425, 1855, 545),   # 右の壁のメモ
    (1445, 175, 1605, 265),   # 天井ぎわのメモ
    (485, 55, 585, 225),      # 左上のメモ
    (785, 885, 1055, 1200),   # 左の洗濯機の貼り紙
    (1095, 875, 1325, 1005),  # 右の洗濯機の貼り紙
    (1245, 1115, 1335, 1385), # 袋の文字
    (1395, 1135, 1545, 1405), # 洗剤の箱
]


def fill_rect(im, x1, y1, x2, y2, pad=12):
    """長方形を、まわりの縁の色（中央値）で塗り、境目をぼかしてなじませる"""
    H, W = im.shape[:2]
    X1, Y1, X2, Y2 = max(0, x1 - pad), max(0, y1 - pad), min(W, x2 + pad), min(H, y2 + pad)
    ring = np.concatenate([im[Y1:y1, X1:X2].reshape(-1, 3), im[y2:Y2, X1:X2].reshape(-1, 3),
                           im[Y1:Y2, X1:x1].reshape(-1, 3), im[Y1:Y2, x2:X2].reshape(-1, 3)])
    # 上下で色が違うときのために、上の縁と下の縁の色で縦にグラデーションする
    top = np.median(im[Y1:y1, X1:X2].reshape(-1, 3), axis=0) if y1 > Y1 else np.median(ring, axis=0)
    bot = np.median(im[y2:Y2, X1:X2].reshape(-1, 3), axis=0) if Y2 > y2 else np.median(ring, axis=0)
    t = np.linspace(0, 1, y2 - y1)[:, None, None]
    patch = (top * (1 - t) + bot * t).astype(np.float32) * np.ones((1, x2 - x1, 1), np.float32)
    m = np.zeros((H, W), np.float32)
    m[y1:y2, x1:x2] = 1
    m = cv2.GaussianBlur(m, (0, 0), pad / 2)
    full = im.astype(np.float32).copy()
    full[y1:y2, x1:x2] = patch
    out = im.astype(np.float32) * (1 - m[..., None]) + full * m[..., None]
    return out.astype(np.uint8)


clean = img.copy()
for r in ERASE:
    clean = fill_rect(clean, *r)

# 16:9 に切り出し、1920x1080 に（右下のカメラの透かしは y=1350 より下なので入らない）
y0 = 120
crop = clean[y0:y0 + 1125, 0:2000]
crop = cv2.resize(crop, (1920, 1080), interpolation=cv2.INTER_AREA)
cv2.imwrite(f"{out_dir}/0-cleaned.png", crop)


def grade(im, warm=1.0, lift=18, sat=0.85):
    f = im.astype(np.float32)
    f = f * (255 - lift) / 255 + lift          # 暗いところを持ち上げる
    hsv = cv2.cvtColor(np.clip(f, 0, 255).astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[..., 1] *= sat
    f = cv2.cvtColor(np.clip(hsv, 0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32)
    f[..., 2] *= warm                          # 赤
    f[..., 0] *= 2 - warm                      # 青
    return np.clip(f, 0, 255).astype(np.uint8)


def glow(im, amount=0.25, radius=25):
    blur = cv2.GaussianBlur(im, (0, 0), radius)
    return cv2.addWeighted(im, 1 - amount, cv2.max(im, blur), amount, 0)


def vignette(im, strength=0.18):
    H, W = im.shape[:2]
    y, x = np.ogrid[:H, :W]
    d = np.sqrt(((x - W / 2) / (W / 2)) ** 2 + ((y - H / 2) / (H / 2)) ** 2)
    v = 1 - strength * np.clip(d - 0.4, 0, 1)
    return np.clip(im.astype(np.float32) * v[..., None], 0, 255).astype(np.uint8)


def paint(im, scale=0.5, sp=10, sr=22, passes=3):
    """小さくして色の面をまとめ（mean shift と bilateral）、元の大きさに戻す"""
    small = cv2.resize(im, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    small = cv2.pyrMeanShiftFiltering(small, sp, sr)
    for _ in range(passes):
        small = cv2.bilateralFilter(small, 9, 40, 9)
    return cv2.resize(small, (im.shape[1], im.shape[0]), interpolation=cv2.INTER_CUBIC)


# 案1: ならしは弱め（写真の形を残す）
a = paint(crop, scale=0.6, sp=6, sr=14, passes=2)
a = vignette(glow(grade(a, warm=1.04, lift=14, sat=0.9), 0.2))
cv2.imwrite(f"{out_dir}/1-light.png", a)

# 案2: 絵っぽく（色の面を大きくまとめる）
b = paint(crop, scale=0.4, sp=12, sr=26, passes=4)
b = vignette(glow(grade(b, warm=1.05, lift=18, sat=0.85), 0.28))
cv2.imwrite(f"{out_dir}/2-painterly.png", b)

# 案3: 案2 を少しぼかす（背景を奥に引かせる。キャラが前に出る）
c = cv2.GaussianBlur(b, (0, 0), 2.0)
cv2.imwrite(f"{out_dir}/3-painterly-soft.png", c)
print("ok")
