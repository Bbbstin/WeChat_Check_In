from flask import jsonify, request, send_from_directory, make_response
from flask_sqlalchemy import SQLAlchemy
import requests
from flask import Flask as _Flask
from flask.json import JSONEncoder as _JSONEncoder
from datetime import datetime, date
from sqlalchemy import create_engine, and_
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import sessionmaker
import decimal
import os
import xlwt


class JSONEncoder(_JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(obj, date):
            return obj.strftime('%Y-%m-%d')
        elif isinstance(obj, decimal.Decimal):
            return float(obj)

        super(JSONEncoder, self).default(obj)


class Flask(_Flask):
    json_encoder = JSONEncoder


app = Flask('test')

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:123456@localhost:3306/checkinsystem'
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

db = SQLAlchemy(app)


@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    if filename == 'backend.py':
        return False
    directory = os.getcwd()
    response = make_response(
        send_from_directory(directory, filename.encode('utf-8').decode('utf-8'), as_attachment=True))
    return response, 200


@app.route('/delete/<filename>', methods=['GET'])
def delete_file(filename):
    directory = os.getcwd()
    filepath = directory + '\\' + filename
    filepath = filepath.replace('\\', '/')
    print(filepath)
    try:
        os.remove(filepath)
        return jsonify('True')
    except:
        return jsonify('False')


@app.route('/create_download', methods=['POST'])
def create_download():
    if request.method == 'POST':
        if not request.json:
            return jsonify('not json')
        else:
            data = request.get_json()
            directory = os.getcwd()
            filename = 'excel' + str(data['time']) + '&' + str(data['Code']) + '.xls'
            workbook = write_excel(data['Code'])
            url = directory + '/' + filename
            print(url)
            workbook.save(url)
            return filename
    else:
        return jsonify('NOT POST')


def write_excel(code):
    sql_stu = 'select id, name from studentinfo ' \
              'where id in (select id from lessonstudent where code = \'' + str(code) + '\')' \
              'order by id'
    cursor_stu = db.session.execute(sql_stu)
    result_stu = cursor_stu.fetchall()
    if result_stu is None:
        return None
    stu_data = [dict(zip(result.keys(), result)) for result in result_stu]
    len_stu = len(stu_data)
    sql_attend = 'select stu_id, convert(time, DATE) as date, attendance from attendinfo where code = \'' + \
                 str(code) + '\' order by stu_id, convert(time, DATE)'
    cursor_att = db.session.execute(sql_attend)
    result_att = cursor_att.fetchall()
    if result_att is None:
        return None
    att_data = [dict(zip(result.keys(), result)) for result in result_att]
    len_attend = int(len(att_data)/len_stu)
    workbook = xlwt.Workbook(encoding='utf-8')
    worksheet = workbook.add_sheet('My Worksheet')
    worksheet.write(0, 0, label='学号')
    worksheet.write(0, 1, label='姓名')
    for i in range(len_attend):
        worksheet.write(0, i + 2, label=str(att_data[i]['date']))
    worksheet.write(0, len_attend + 2, label='缺勤数')
    worksheet.write(0, len_attend + 3, label='请假数')
    for i in range(len_stu):
        worksheet.write(i + 1, 0, label=str(stu_data[i]['id']))
        worksheet.write(i + 1, 1, label=str(stu_data[i]['name']))
        num_abs = 0
        num_lea = 0
        for j in range(len_attend):
            if att_data[j + i * len_attend]['attendance'] == '缺勤':
                flag = 'x'
                num_abs += 1
            elif att_data[j + i * len_attend]['attendance'] == '出勤':
                flag = '√'
            elif att_data[j + i * len_attend]['attendance'] == '请假':
                flag = '请假'
                num_lea += 1
            worksheet.write(i + 1, j + 2, label=flag)
        worksheet.write(i + 1, len_attend + 2, label=num_abs)
        worksheet.write(i + 1, len_attend + 3, label=num_lea)
    return workbook


@app.route('/wxlogin', methods=['GET', 'POST'])  # 获取微信openid
def wxlogin():
    data = request.get_json()
    appID = '{Your appID}'
    appSecret = '{Your appSecret}'
    code = data['code']
    req_params = {
        'appid': appID,
        'secret': appSecret,
        'js_code': code,
        'grant_type': 'authorization_code'
    }
    wx_login_api = 'https://api.weixin.qq.com/sns/jscode2session'
    response_data = requests.get(wx_login_api, params=req_params)
    resData = response_data.json()
    openid = resData['openid']
    return_data = {'openid': openid}
    return jsonify(return_data)


@app.route('/login', methods=['GET', 'POST'])  # 登录
def login():
    if request.method == 'POST':
        if not request.json:
            return jsonify('not json')
        else:
            data = request.get_json()
            return_data = dict()
            wechatid = data['WechatId']
            id = data['id']
            role = data['role']
            name = data['name']
            if role == 1:
                db_data = search_teacher(wechatid, id, name)
                if db_data:
                    return_data['Id'] = db_data['Id']
                    return_data['Name'] = db_data['Name']
                    return_data['flag'] = 1
                else:
                    return_data['flag'] = 0
            if role == 0:
                db_data = search_student(wechatid, id, name)
                if db_data:
                    return_data['Id'] = db_data['Id']
                    return_data['Name'] = db_data['Name']
                    return_data['Dep'] = db_data['Dep']
                    return_data['Major'] = db_data['Major']
                    return_data['Sex'] = db_data['Sex']
                    return_data['Grade'] = db_data['Grade']
                    return_data['flag'] = 1
                else:
                    return_data['flag'] = 0
            return jsonify(return_data)
    else:
        return jsonify('not POST')


def search_student(wechatid, id, name):
    result = studentinfo.query.filter_by(Id=id).first()
    if result is None:
        return None
    result = result.to_dict()
    if result['Name'] != name:
        return None
    if result['openID'] == wechatid:
        return result
    elif result['openID'] is None:
        try:
            data = db.session.query(studentinfo).filter_by(Id=id).first()
            data.openID = wechatid
            db.session.commit()
            db.session.close()
            return result
        except:
            db.session.rollback()
            return None
    else:
        return None


def search_teacher(wechatid, id, name):
    result = teacherinfo.query.filter_by(Id=id).first()
    if result is None:
        return None
    result = result.to_dict()
    if result['Name'] != name:
        return None
    if result['openID'] == wechatid:
        return result
    elif result['openID'] is None:
        try:
            data = db.session.query(teacherinfo).filter_by(Id=id).first()
            data.openID = wechatid
            db.session.commit()
            db.session.close()
            return result
        except:
            db.session.rollback()
            return None
    else:
        return None


@app.route('/teacher/search_lesson', methods=['GET', 'POST'])  # 查找老师教授的课程
def search_lesson_t():
    if request.method == 'POST':
        if not request.json:
            return jsonify('not json')
        else:
            data = request.get_json()
            result = search_lesson_for_teacher(data['Id'])
            if result is None:
                return jsonify('False')
            return result
    else:
        return jsonify('not POST')


def search_lesson_for_teacher(teacher_id):
    sql = 'select * from lessoninfo where code ' \
          'in (select code from lessonteacher where id=\''+str(teacher_id)+'\')'
    cursor = db.session.execute(sql)
    results = cursor.fetchall()
    if results is None:
        return None
    return_data = [dict(zip(result.keys(), result)) for result in results]
    return jsonify(return_data)


@app.route('/teacher/launch', methods=['GET', 'POST'])  # 老师发布课程，对课程表修改
def launch():
    if request.method == 'POST':
        if not request.json:
            return jsonify('not json')
        else:
            data = request.get_json()
            result = update_lesson_and_insert_attend(data['code'], data['time'])
            if result:
                return jsonify('True')
            else:
                return jsonify('False')
    else:
        return jsonify('not POST')


def update_lesson_and_insert_attend(code, time):
    data1 = db.session.query(lessoninfo).filter_by(Code=code).first()
    results = lessonstudent.query.filter_by(Code=code).all()
    data2 = {}
    for i in range(len(results)):
        data2[i] = results[i].to_dict()
    try:
        data1.Times += 1
        engine = create_engine('mysql+mysqlconnector://root:123456@localhost:3306/checkinsystem')
        Base = automap_base()
        Base.prepare(engine, reflect=True)
        Base.classes.keys()
        Session = sessionmaker(bind=engine)
        session = Session()
        for i in range(len(data2)):
            attendance_data = attendinfo(Stu_Id=data2[i]['Id'], Code=data2[i]['Code'], Time=time, Attendance='缺勤')
            session.add(attendance_data)
        print(1)
        session.commit()
        session.close()
        return 1
    except:
        session.rollback()
        return 0


@app.route('/teacher/search_leave', methods=['GET', 'POST'])  # 查找缺勤信息
def search_leave():
    if request.method == 'POST':
        if not request.json:
            return jsonify('not json')
        else:
            data = request.get_json()
            result = search_leave_info(data['Code'], data['Time'])
            return result
    else:
        return jsonify('not POST')


def search_leave_info(code, time):
    sql = 'select * from attendinfo as t1 inner join (select name, id from studentinfo) as t2 ' \
          'on t1.stu_id = t2.id ' \
          'where t1.code=\'' + str(code) + '\' and CONVERT(t1.time, DATE)=\'' + str(time) + '\' and t1.attendance = 1'
    cursor = db.session.execute(sql)
    results = cursor.fetchall()
    if results is None:
        return None
    return_data = [dict(zip(result.keys(), result)) for result in results]
    return jsonify(return_data)


@app.route('/teacher/update_attend', methods=['GET', 'POST'])  # 老师更改学生请假状态
def update_attend():
    if request.method == 'POST':
        if not request.json:
            return jsonify('not json')
        else:
            data = request.get_json()
            result = update_attend_stu(data['Id'], data['time'][:10], data['code'], data['flag'])
            return result
    else:
        return jsonify('not POST')


def update_attend_stu(stu_id, time, code, flag):
    try:
        data = db.session.query(attendinfo).filter(and_(attendinfo.Time.like(str(time)+'%'),
                                            attendinfo.Stu_Id == str(stu_id),
                                                        attendinfo.Code == str(code))).first()
        data.Attendance = str(flag)
        db.session.commit()
        db.session.close()
        return jsonify('True')
    except:
        db.session.rollback()
        return jsonify('False')


@app.route('/student/search_lesson', methods=['GET', 'POST'])  # 查找学生上的课
def search_lesson_s():
    if request.method == 'POST':
        if not request.json:
            return jsonify('not json')
        else:
            data = request.get_json()
            result = search_lesson_for_student(data['Id'])
            if result is None:
                return jsonify('False')
            return jsonify(result)
    else:
        return jsonify('not POST')


def search_lesson_for_student(student_id):
    sql = 'select * from lessoninfo where code in (select code from lessonstudent where id=\'' + str(student_id) + '\')'
    cursor = db.session.execute(sql)
    results = cursor.fetchall()
    if results is None:
        return None
    return_data = [dict(zip(result.keys(), result)) for result in results]
    return return_data


# @app.route('/student/insert_attend', methods=['GET', 'POST'])  # 插入学生出勤信息
# def insert_attend():
#     if request.method == 'POST':
#         if not request.json:
#             return jsonify('not json')
#         else:
#             data = request.get_json()
#             result = insert_attend_stu(data['id'], data['code'], data['time'], data['attendance'])
#             return result
#     else:
#         return jsonify('not POST')
#
#
# def insert_attend_stu(stu_id, code, time, attendance):
#     try:
#         attendance_data = attendinfo(Stu_Id=stu_id, Code=code, Time=time, Attendance=attendance)
#         db.session.add(attendance_data)
#         db.session.commit()
#         db.session.close()
#         return jsonify('True')
#     except:
#         return jsonify('False')


@app.route('/search/for_student', methods=['GET', 'POST'])  # 学生界面查找个人某课考勤信息
def search_for_stu():
    if request.method == 'POST':
        if not request.json:
            return jsonify('not json')
        else:
            data = request.get_json()
            result = search_by_id_code(data['Id'], data['Code'])
            if result is None:
                return jsonify('False')
            return result
    else:
        return jsonify('not POST')


# def search_by_stu(stu_id):
#     result = attendinfo.query.filter_by(Stu_Id=stu_id).all()
#     if result is None:
#         return None
#     result_length = len(result)
#     return_data = {}
#     i = 0
#     while i < result_length:
#         return_data[i] = result[i].to_dist()
#         i += 1
#     return jsonify(return_data)


def search_by_id_code(stu_id, code):
    result = attendinfo.query.filter_by(Stu_Id=stu_id, Code=code).all()
    if result is None:
        return None
    return_data = {}
    for i in range(len(result)):
        return_data[i] = result[i].to_dict()
    return jsonify(return_data)


# 老师界面查找某课程所有考勤信息,输入课程名，输出每次考勤的统计
@app.route('/search/for_teacher_all_lesson', methods=['GET', 'POST'])
def search_for_teacher_all_lesson():
    if request.method == 'POST':
        if not request.json:
            return jsonify('not json')
        else:
            data = request.get_json()
            result = search_by_code(data['code'])
            if result is None:
                return jsonify('False')
            return jsonify(result)
    else:
        return jsonify('not POST')


def search_by_code(code):
    sql = 'select CONVERT(Time,DATE) as \'time\', sum(Attendance=2) as \'attend\', ' \
          'sum(Attendance=1) as \'absent\', sum(Attendance=3) as \'leave\'' \
          'from attendinfo where code=\''+str(code)+'\' group by CONVERT(Time,DATE)'
    cursor = db.session.execute(sql)
    results = cursor.fetchall()
    if results is None:
        return None
    return_data = {}
    for i in range(len(results)):
        return_data[i] = dict(zip(results[i].keys(), results[i]))
    return return_data


@app.route('/search/for_teacher_a_lesson', methods=['GET', 'POST'])  # 老师界面查找某课某时间全体学生考勤信息
def search_for_teacher_a_lesson():
    if request.method == 'POST':
        if not request.json:
            return jsonify('not json')
        else:
            data = request.get_json()
            result = search_by_code_time(data['Code'], data['Time'])
            if result is None:
                return jsonify('False')
            return result
    else:
        return jsonify('not POST')


def search_by_code_time(code, time):
    result = attendinfo.query.filter_by(Code=code, Time=time).all()
    if result is None:
        return None
    return_data = {}
    for i in range(len(result)):
        return_data[i] = result[i].to_dict()
    return jsonify(return_data)


@app.route('/search/for_all', methods=['GET', 'POST'])  # 统计界面
def search_for_all():
    if request.method == 'POST':
        if not request.json:
            return jsonify('not json')
        else:
            data = request.get_json()
            if data['mode'] == 'dep':
                result = search_for_all_dep(data['code'])
            elif data['mode'] == 'grade':
                result = search_for_all_grade(data['code'])
            elif data['mode'] == 'sex':
                result = search_for_all_sex(data['code'])
            return result
    else:
        return jsonify('not POST')


def search_for_all_dep(code):
    sql1 = 'select t2.dep as dep, sum(t1.attendance=1) as absent, ' \
          'sum(t1.attendance=2) as attend, sum(t1.attendance=3) as `leave` ' \
          'from (select stu_id, attendance from attendinfo'
    sql2 = ') as t1 inner join (select id, dep, name from studentinfo) as t2 on t1.stu_id = t2.id group by t2.dep'
    if code == 'all':
        sql = sql1 + sql2
    else:
        sql = sql1 + ' where code=\'' + str(code) + '\' ' + sql2
    cursor = db.session.execute(sql)
    results = cursor.fetchall()
    if results is None:
        return None
    return_data = [dict(zip(result.keys(), result)) for result in results]
    return jsonify(return_data)


def search_for_all_grade(code):
    sql1 = 'select t2.grade as grade, sum(t1.attendance=1) as absent, ' \
           'sum(t1.attendance=2) as attend, sum(t1.attendance=3) as `leave` ' \
           'from (select stu_id, attendance from attendinfo'
    sql2 = ') as t1 inner join (select id, grade from studentinfo) as t2 on t1.stu_id = t2.id group by t2.grade'
    if code == 'all':
        sql = sql1 + sql2
    else:
        sql = sql1 + ' where code=\'' + str(code) + '\' ' + sql2
    cursor = db.session.execute(sql)
    results = cursor.fetchall()
    if results is None:
        return None
    return_data = [dict(zip(result.keys(), result)) for result in results]
    return jsonify(return_data)


def search_for_all_sex(code):
    sql1 = 'select t2.sex as sex, sum(t1.attendance=1) as absent, ' \
           'sum(t1.attendance=2) as attend, sum(t1.attendance=3) as `leave` ' \
           'from (select stu_id, attendance from attendinfo'
    sql2 = ') as t1 inner join (select id, sex from studentinfo) as t2 on t1.stu_id = t2.id group by t2.sex'
    if code == 'all':
        sql = sql1 + sql2
    else:
        sql = sql1 + ' where code=\'' + str(code) + '\' ' + sql2
    cursor = db.session.execute(sql)
    results = cursor.fetchall()
    if results is None:
        return None
    return_data = [dict(zip(result.keys(), result)) for result in results]
    return jsonify(return_data)


class studentinfo(db.Model):
    __tablename__ = 'studentinfo'
    Id = db.Column(db.VARCHAR(11), primary_key=True, unique=True, nullable=False)
    Name = db.Column(db.VARCHAR(20), nullable=False)
    Dep = db.Column(db.VARCHAR(20), nullable=False)
    Major = db.Column(db.VARCHAR(20))
    Sex = db.Column(db.VARCHAR(6))
    Grade = db.Column(db.INT)
    openID = db.Column(db.VARCHAR(50), unique=True)

    def to_dict(self):
        return {c.name: getattr(self, c.name, None) for c in self.__table__.columns}


class teacherinfo(db.Model):
    __tablename__ = 'teacherinfo'
    Id = db.Column(db.VARCHAR(11), primary_key=True, unique=True, nullable=False)
    Name = db.Column(db.VARCHAR(20), nullable=False)
    openID = db.Column(db.VARCHAR(50), unique=True, nullable=False)

    def to_dict(self):
        return {c.name: getattr(self, c.name, None) for c in self.__table__.columns}


class lessoninfo(db.Model):
    __tablename__ = 'lessoninfo'
    Code = db.Column(db.VARCHAR(20), primary_key=True, nullable=False, unique=True)
    Name = db.Column(db.VARCHAR(20), nullable=False)
    Num = db.Column(db.INT)
    Times = db.Column(db.INT, nullable=False, default=0)
    Place = db.Column(db.VARCHAR(10))

    def to_dict(self):
        return {c.name: getattr(self, c.name, None) for c in self.__table__.columns}


class lessonteacher(db.Model):
    __tablename__ = 'lessonteacher'
    Code = db.Column(db.VARCHAR(20), db.ForeignKey('lessoninfo.Code'), primary_key=True, nullable=False)
    Id = db.Column(db.VARCHAR(11), db.ForeignKey('teacherinfo.Id'), primary_key=True, nullable=False)

    def to_dict(self):
        return {c.name: getattr(self, c.name, None) for c in self.__table__.columns}


class lessonstudent(db.Model):
    __tablename__ = 'lessonstudent'
    Code = db.Column(db.VARCHAR(20), db.ForeignKey('lessoninfo.Code'), primary_key=True, nullable=False)
    Id = db.Column(db.VARCHAR(11), db.ForeignKey('studentinfo.Id'), primary_key=True, nullable=False)

    def to_dict(self):
        return {c.name: getattr(self, c.name, None) for c in self.__table__.columns}


class attendinfo(db.Model):
    __tablename__ = 'attendinfo'
    Id = db.Column(db.INT, primary_key=True, nullable=False, unique=True, autoincrement=True)
    Stu_Id = db.Column(db.VARCHAR(11), db.ForeignKey('studentinfo.Id'), nullable=False)
    Code = db.Column(db.VARCHAR(20), db.ForeignKey('lessoninfo.Code'), nullable=False)
    Time = db.Column(db.DateTime)
    Attendance = db.Column(db.Enum('缺勤', '出勤', '请假'))

    def to_dict(self):
        return {c.name: getattr(self, c.name, None) for c in self.__table__.columns}


if __name__ == '__main__':
    app.run()
