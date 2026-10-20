# 別の AI が絵に寄せたランドリーの画像から、貼り紙・メモ・商品のロゴを消して 16:9 に切り出す（段階2の試作）
# 貼り紙は個人や家を特定されないよう、文字が読めるものを全部消す。
# 使い方（omoikomi/ で）: uv run --with opencv-python-headless --with numpy python tools/clean_ai_bg.py <画像> <出力.png>
import sys
import cv2
import numpy as np

src, out = sys.argv[1], sys.argv[2]
img = cv2.imread(src)  # 1448x1086

# 消す場所（x1, y1, x2, y2）
ERASE = [
    (236, 230, 340, 635),     # 左の壁の貼り紙
    (330, 0, 395, 115),       # 左上のメモ
    (1070, 70, 1205, 165),    # 右上のメモ
    (1070, 255, 1190, 340),   # 右の壁のメモ
    (1205, 280, 1345, 380),   # 右の壁のメモ
    (1060, 340, 1155, 505),   # 右の壁の貼り紙
    (505, 645, 752, 895),     # 左の洗濯機の貼り紙
    (808, 643, 995, 758),     # 右の洗濯機の貼り紙
    (1065, 850, 1215, 1065),  # 洗剤の箱
]


def fill_rect(im, x1, y1, x2, y2, pad=10):
    """長方形を、上の縁と下の縁の色（中央値）の縦グラデーションで塗り、境目をぼかしてなじませる"""
    H, W = im.shape[:2]
    X1, Y1, X2, Y2 = max(0, x1 - pad), max(0, y1 - pad), min(W, x2 + pad), min(H, y2 + pad)
    ring = np.concatenate([im[Y1:y1, X1:X2].reshape(-1, 3), im[y2:Y2, X1:X2].reshape(-1, 3),
                           im[Y1:Y2, X1:x1].reshape(-1, 3), im[Y1:Y2, x2:X2].reshape(-1, 3)])
    top = np.median(im[Y1:y1, X1:X2].reshape(-1, 3), axis=0) if y1 > Y1 else np.median(ring, axis=0)
    bot = np.median(im[y2:Y2, X1:X2].reshape(-1, 3), axis=0) if Y2 > y2 else np.median(ring, axis=0)
    t = np.linspace(0, 1, y2 - y1)[:, None, None]
    patch = (top * (1 - t) + bot * t).astype(np.float32) * np.ones((1, x2 - x1, 1), np.float32)
    m = np.zeros((H, W), np.float32)
    m[y1:y2, x1:x2] = 1
    m = cv2.GaussianBlur(m, (0, 0), pad / 2)
    full = im.astype(np.float32).copy()
    full[y1:y2, x1:x2] = patch
    return (im.astype(np.float32) * (1 - m[..., None]) + full * m[..., None]).astype(np.uint8)


for r in ERASE:
    img = fill_rect(img, *r)

# 16:9 に切り出し（幅 1448 → 高さ 814）、1920x1080 に
y0 = 100
crop = img[y0:y0 + 814, :]
crop = cv2.resize(crop, (1920, 1080), interpolation=cv2.INTER_CUBIC)
cv2.imwrite(out, crop)
print(out)
