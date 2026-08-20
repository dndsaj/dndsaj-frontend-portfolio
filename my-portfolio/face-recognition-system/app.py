import tkinter as tk
from tkinter import messagebox
import subprocess
import os

# 主窗口初始化
root = tk.Tk()
root.title("人脸识别系统")
root.geometry("500x550")
root.resizable(False, False)

# 设置字体和样式
title_font = ("微软雅黑", 18, "bold")
btn_font = ("微软雅黑", 14)

# 定义按钮功能
def open_face_register():
    """打开人脸录入功能"""
    if not os.path.exists("face_register.py"):
        messagebox.showerror("错误", "未找到人脸录入文件 face_register.py，请检查文件路径")
        return
    try:
        si = subprocess.STARTUPINFO()
        si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        subprocess.Popen(["python", "face_register.py"], startupinfo=si)
    except Exception as e:
        messagebox.showerror("启动失败", f"启动人脸录入失败：\n{str(e)}")

def start_face_recognize():
    """启动人脸识别功能"""
    if not os.path.exists("face_recognize.py"):
        messagebox.showerror("错误", "未找到人脸识别文件 face_recognize.py，请检查文件路径")
        return
    if not os.path.exists("face_database.pkl"):
        messagebox.showwarning("提示", "未找到人脸数据库，请先录入人脸")
        return
    try:
        si = subprocess.STARTUPINFO()
        si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        subprocess.Popen(["python", "face_recognize.py"], startupinfo=si)
    except Exception as e:
        messagebox.showerror("启动失败", f"启动人脸识别失败：\n{str(e)}")

def open_db_manage():
    """打开人脸数据库管理"""
    if not os.path.exists("manage_face_db.py"):
        messagebox.showerror("错误", "未找到管理文件 manage_face_db.py，请检查文件路径")
        return
    if not os.path.exists("face_database.pkl"):
        messagebox.showwarning("提示", "数据库文件 face_database.pkl 不存在，请先录入人脸")
        return
    try:
        si = subprocess.STARTUPINFO()
        si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        subprocess.Popen(["python", "manage_face_db.py"], startupinfo=si)
    except Exception as e:
        messagebox.showerror("启动失败", f"启动数据库管理失败：\n{str(e)}")

def exit_system():
    """退出系统"""
    if messagebox.askokcancel("退出确认", "确定要关闭人脸识别系统吗？"):
        root.quit()

# 绘制界面
title_label = tk.Label(root, text="🎈 人脸识别管理系统", font=title_font, pady=30)
title_label.pack()

# 功能按钮
btn1 = tk.Button(root, text="启动人脸识别", font=btn_font, width=20, height=2, bg="#4CAF50", fg="white", command=open_face_register)
btn1.pack(pady=8)

btn2 = tk.Button(root, text="启动人脸录入", font=btn_font, width=20, height=2, bg="#2196F3", fg="white", command=start_face_recognize)
btn2.pack(pady=8)

btn3 = tk.Button(root, text="管理人脸数据库", font=btn_font, width=20, height=2, bg="#FF9800", fg="white", command=open_db_manage)
btn3.pack(pady=8)

btn4 = tk.Button(root, text="❌ 退出系统", font=btn_font, width=20, height=2, bg="#f44336", fg="white", command=exit_system)
btn4.pack(pady=8)

# 启动主窗口
root.mainloop()
