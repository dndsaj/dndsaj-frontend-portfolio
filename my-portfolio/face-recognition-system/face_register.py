import cv2
import pickle
import numpy as np
from insightface.app import FaceAnalysis
from PIL import Image, ImageDraw, ImageFont
import tkinter as tk
from tkinter import messagebox

# -------------------------- 核心配置（可自行调整参数） --------------------------
SIMILARITY_THRESHOLD = 0.6  # 余弦相似度阈值
FRAME_SKIP = 6               # 跳帧检测参数
EXTRABAR_HEIGHT = 120         # 下方操作区域高度（数值越大按钮越靠上）
BUTTON_WIDTH = 280            # 按钮宽度
BUTTON_HEIGHT = 50            # 按钮高度

# 初始化模型，和录入保持一致
app = FaceAnalysis(providers=['CPUExecutionProvider'], name='buffalo_l')
app.prepare(ctx_id=0, det_size=(640, 640))

# 加载人脸数据库
with open("face_database.pkl", "rb") as f:
    known_faces = pickle.load(f)

# 保存当前帧识别结果的全局变量，供提取按钮调用
current_recognized = []

# 中文绘制解决乱码
def draw_chinese_text(img, text, position, font_size=20, color=(0,255,0)):
    img_pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(img_pil)
    try:
        font = ImageFont.truetype("simhei.ttf", font_size)
    except:
        font = ImageFont.load_default(font_size)
    draw.text(position, text, fill=color[::-1], font=font)
    return cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)

# 余弦相似度计算（InsightFace官方标准算法）
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# 只提取当前识别到的人脸信息弹窗
def scan_current_info():
    global current_recognized
    matched_faces = [info for (_, info) in current_recognized if info != "未知人员"]
    if not matched_faces:
        messagebox.showinfo("提示", "当前画面未识别到已录入人员")
        return
    
    all_info = f"当前识别到 {len(matched_faces)} 个已录入人员：\n\n"
    for i, info in enumerate(matched_faces, 1):
        all_info += f"【{i}】\n"
        all_info += f"姓名：{info.get('name', '无')}\n"
        all_info += f"学号：{info.get('student_id', '无')}\n"
        all_info += f"学院：{info.get('college', '无')}\n"
        all_info += f"班级：{info.get('class', '无')}\n"
        all_info += f"班主任：{info.get('head_teacher', '无')}\n"
        all_info += f"手机号：{info.get('phone', '无')}\n"
        all_info += "------------------------\n"
    
    # 隐藏tk主窗口，只弹信息框
    root = tk.Tk()
    root.withdraw()
    messagebox.showinfo("识别结果详情", all_info.strip())
    root.destroy()

# 打开摄像头
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480 - EXTRABAR_HEIGHT)

frame_count = 0
button_start_y = (480 - EXTRABAR_HEIGHT) + (EXTRABAR_HEIGHT - BUTTON_HEIGHT) // 2  # 垂直居中计算
# 计算按钮坐标实现水平居中：按钮左上角x坐标
button_start_x = (640 - BUTTON_WIDTH) // 2

# 检测鼠标点击（用于触发按钮点击）
def mouse_click(event, x, y, flags, param):
    if event == cv2.EVENT_LBUTTONDOWN:
        # 判断点击范围是不是在按钮区域内
        if button_start_x <= x <= button_start_x + BUTTON_WIDTH and button_start_y <= y <= button_start_y + BUTTON_HEIGHT:
            scan_current_info()

# 先创建窗口，再绑定回调，避免报错
cv2.namedWindow("Lyx-xitong")
cv2.setMouseCallback("Lyx-xitong", mouse_click)

# 创建一个离线的tk对象，用于触发弹窗（不显示主窗口）
root = tk.Tk()
root.withdraw()

print("🔍 人脸识别启动，按 q 退出，点击下方按钮查看当前识别详情")
while True:
    ret, frame = cap.read()
    if not ret:
        break
    # 和录入一致的镜像翻转
    frame = cv2.flip(frame, 1)
    
    # 跳帧检测保证流畅
    if frame_count % FRAME_SKIP == 0:
        faces = app.get(frame)
        current_recognized = []  # 清空上一轮结果
        for face in faces:
            current_emb = face.embedding
            # 和数据库所有人脸计算相似度
            max_sim = 0
            match_info = None
            for item in known_faces:
                know_emb = item["encoding"]
                sim = cosine_similarity(current_emb, know_emb)
                if sim > max_sim:
                    max_sim = sim
                    match_info = item["info"]
            # 阈值判断，显示格式改为 姓名-班级
            if max_sim >= SIMILARITY_THRESHOLD:
                show_text = f"{match_info['name']}-{match_info['class']} ({max_sim:.2f})"
                current_recognized.append((face.bbox.astype(int), match_info))
            else:
                current_recognized.append((face.bbox.astype(int), "未知人员"))
    
    # 绘制识别结果
    frame_result = frame.copy()
    for (bbox, info) in current_recognized:
        if info == "未知人员":
            show_text = "未知人员"
            color = (0, 0, 255)
        else:
            show_text = f"{info['name']}-{info['class']}"
            color = (0, 255, 0)
        cv2.rectangle(frame_result, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
        frame_result = draw_chinese_text(frame_result, show_text, (bbox[0], bbox[1]-30), 20, color)
    
    # 创建下方操作区域
    full_height = frame_result.shape[0] + EXTRABAR_HEIGHT
    full_frame = np.zeros((full_height, frame_result.shape[1], 3), dtype=np.uint8)
    full_frame[:frame_result.shape[0], :, :] = frame_result
    
    # 绘制按钮背景
    cv2.rectangle(full_frame, (button_start_x, button_start_y), (button_start_x + BUTTON_WIDTH, button_start_y + BUTTON_HEIGHT), (33, 150, 33), -1)
    
    # 计算文字坐标，实现按钮内垂直水平居中
    button_text = "查看当前识别详情"
    # PIL文字居中计算
    img_pil = Image.fromarray(full_frame)
    draw = ImageDraw.Draw(img_pil)
    try:
        font = ImageFont.truetype("simhei.ttf", 22)
    except:
        font = ImageFont.load_default(22)
    
    # 获取文字尺寸计算居中坐标
    left, top, right, bottom = draw.textbbox((0, 0), button_text, font=font)
    text_w = right - left
    text_h = bottom - top
    text_x = button_start_x + (BUTTON_WIDTH - text_w) // 2
    text_y = button_start_y + (BUTTON_HEIGHT - text_h) // 2
    
    # 绘制居中文字
    draw.text((text_x, text_y), button_text, fill=(255,255,255), font=font)
    full_frame = np.array(img_pil)
    
    cv2.imshow("Lyx-xitong", full_frame)
    frame_count += 1
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
