import cv2
import pickle
import numpy as np
from insightface.app import FaceAnalysis

# 初始化模型
app = FaceAnalysis(providers=['CPUExecutionProvider'], name='buffalo_l')
app.prepare(ctx_id=0, det_size=(640, 640))

# 打开摄像头
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

# ------------------- 关键修改：存储结构改为用户信息字典 -------------------
known_faces = []

try:
    with open("face_database.pkl", "rb") as f:
        known_faces = pickle.load(f)
    print(f"检测到已有数据库，当前已录入 {len(known_faces)} 人，将追加新用户")
except FileNotFoundError:
    print("未找到已有数据库，将创建新数据库")

max_capture = 10
captured_count = 0

# 收集用户完整信息
print("请录入用户完整信息：")
user_info = {}
user_info["name"] = input("请输入姓名：").strip()
user_info["student_id"] = input("请输入学号：").strip()
user_info["college"] = input("请输入学院：").strip()
user_info["class"] = input("请输入班级：").strip()
user_info["head_teacher"] = input("请输入班主任：").strip()
user_info["phone"] = input("请输入手机号：").strip()

# 检查姓名是否重复
for idx, face in enumerate(known_faces):
    if face["info"]["name"] == user_info["name"]:
        confirm = input(f"姓名 {user_info['name']} 已存在，是否覆盖？输入y确认，其他取消：").lower()
        if confirm != 'y':
            print("已取消录入")
            exit()
        # 覆盖原数据
        del known_faces[idx]
        break

temp_encodings = []
print("请正对摄像头，缓慢转动头部，按 'q' 可提前退出")

while True:
    ret, frame = cap.read()
    if not ret:
        print("摄像头读取失败，请检查设备权限！")
        break
    frame = cv2.flip(frame, 1)
    faces = app.get(frame)
    
    for face in faces:
        bbox = face.bbox.astype(int)
        cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
        cv2.putText(frame, f"Captured: {captured_count}/{max_capture}", 
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        if captured_count < max_capture:
            temp_encodings.append(face.embedding)
            captured_count += 1
    
    cv2.imshow("人脸录入", frame)
    key = cv2.waitKey(1) & 0xFF
    if key == ord('q') or captured_count >= max_capture:
        break

# 保存数据
if len(temp_encodings) > 0:
    avg_embedding = np.mean(temp_encodings, axis=0)
    # 打包信息和特征
    known_faces.append({
        "info": user_info,
        "encoding": avg_embedding
    })

    with open("face_database.pkl", "wb") as f:
        pickle.dump(known_faces, f)

    names = [f["info"]["name"] for f in known_faces]
    print(f"\n✅ 录入完成，当前数据库共 {len(known_faces)} 人：{', '.join(names)}")
else:
    print("\n❌ 未采集到有效人脸，录入取消")

cap.release()
cv2.destroyAllWindows()
