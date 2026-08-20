import pickle
import tkinter as tk
from tkinter import messagebox, simpledialog

def load_database():
    try:
        with open("face_database.pkl", "rb") as f:
            return pickle.load(f)
    except FileNotFoundError:
        messagebox.showerror("错误", "未找到face_database.pkl数据库文件，请先录入人脸！")
        return None

def save_database(data):
    with open("face_database.pkl", "wb") as f:
        pickle.dump(data, f)

def refresh_list():
    # 刷新列表，只显示姓名
    listbox.delete(0, tk.END)
    for face in known_faces:
        listbox.insert(tk.END, face["info"]["name"])

def show_detail(event):
    # 点击查看详情
    selected = listbox.curselection()
    if not selected:
        return
    idx = selected[0]
    info = known_faces[idx]["info"]
    
    # 拼接详情文本
    detail = f"""姓名：{info.get('name', '无')}
学号：{info.get('student_id', '无')}
学院：{info.get('college', '无')}
班级：{info.get('class', '无')}
班主任：{info.get('head_teacher', '无')}
手机号：{info.get('phone', '无')}
    """
    messagebox.showinfo("用户详情", detail.strip())

def delete_selected():
    # 删除选中人员
    selected = listbox.curselection()
    if not selected:
        messagebox.showwarning("提示", "请先选择要删除的人员！")
        return
    idx = selected[0]
    name = known_faces[idx]["info"]["name"]
    
    confirm = messagebox.askyesno("确认删除", f"确定要删除 {name} 吗？此操作不可恢复！")
    if confirm:
        del known_faces[idx]
        save_database(known_faces)
        refresh_list()
        messagebox.showinfo("成功", f"已删除 {name}")

def rename_selected():
    # 重命名选中人员
    selected = listbox.curselection()
    if not selected:
        messagebox.showwarning("提示", "请先选择要修改的人员！")
        return
    idx = selected[0]
    old_name = known_faces[idx]["info"]["name"]
    
    new_name = simpledialog.askstring("修改姓名", f"当前姓名：{old_name}\n请输入新姓名：")
    if not new_name or new_name.strip() == "":
        return
    new_name = new_name.strip()
    
    # 检查重复
    for face in known_faces:
        if face["info"]["name"] == new_name:
            messagebox.showerror("错误", "该姓名已存在，请使用其他姓名！")
            return
    
    known_faces[idx]["info"]["name"] = new_name
    save_database(known_faces)
    refresh_list()
    messagebox.showinfo("成功", f"已修改为 {new_name}")

def show_count():
    # 显示统计信息
    cnt = len(known_faces)
    messagebox.showinfo("数据库信息", f"当前数据库共录入 {cnt} 个人脸数据")

# 初始化窗口
root = tk.Tk()
root.title("LYX 人脸数据库管理")
root.geometry("400x500")
root.resizable(False, False)

# 加载数据库
known_faces = load_database()
if known_faces is None:
    root.destroy()
    exit()

# 标题
title_label = tk.Label(root, text="人脸数据库管理", font=("微软雅黑", 16, "bold"))
title_label.pack(pady=15)

# 提示文本
tip_label = tk.Label(root, text="双击姓名查看详细信息", font=("微软雅黑", 9), fg="#666666")
tip_label.pack()

# 列表框
listbox = tk.Listbox(root, width=40, height=15, font=("微软雅黑", 11))
listbox.pack(pady=10)
# 绑定双击事件查看详情
listbox.bind('<Double-Button-1>', show_detail)
refresh_list()

# 按钮区域
btn_frame = tk.Frame(root)
btn_frame.pack(pady=15)

btn_delete = tk.Button(btn_frame, text="删除选中", width=10, bg="#ff4444", fg="white", command=delete_selected)
btn_delete.grid(row=0, column=0, padx=5)

btn_rename = tk.Button(btn_frame, text="修改姓名", width=10, command=rename_selected)
btn_rename.grid(row=0, column=1, padx=5)

btn_info = tk.Button(btn_frame, text="数据库信息", width=10, command=show_count)
btn_info.grid(row=0, column=2, padx=5)

# 启动主循环
root.mainloop()
