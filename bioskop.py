import base64
from functools import wraps
from lib2to3.pgen2 import token
from sqlite3 import Timestamp
from wsgiref import headers
from flask import Flask, jsonify, request, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from datetime import date, datetime, timedelta 
import time
import jwt
import datetime as dt


app = Flask(__name__)
app.config['SECRET_KEY']='secret'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI']='postgresql://postgres:postgres@localhost:5432/bioskop?sslmode=disable'
db = SQLAlchemy(app)
CORS(app, resources={r"/*": {"origins": "*"}})


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    nama = db.Column(db.String, nullable=False)
    username = db.Column(db.String(14), nullable=False)
    password = db.Column(db.String, nullable=False)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    nama = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(14), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    saldo = db.Column(db.Integer, nullable=False)
    transaksi_rel = db.relationship("Transaksi", backref="user") #noted
    topup_rel = db.relationship("Topup", backref="user") #noted

class Film(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    judul = db.Column(db.String, nullable=False)
    film_kategori = db.Column(db.String, nullable=False)
    deskripsi = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    produksi = db.Column(db.Text, nullable=False)
    durasi = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(50), nullable=False)
    image = db.Column(db.String(50), nullable=True)
    kategori_id = db.Column(db.Integer, db.ForeignKey('kategori.id'), nullable=False)
    jadwal_rel = db.relationship("Jadwal", backref="film") #noted

class Kategori(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    kategori_film = db.Column(db.String, nullable=False)
    film_rel = db.relationship("Film", backref="kategori", cascade="all, delete") #noted

class Teater(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    nama = db.Column(db.String(50), nullable=False)
    kapasitas = db.Column(db.Integer, nullable=False)
    teater_rel = db.relationship("Jadwal", backref="teater") #noted

class Jadwal(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    hari = db.Column(db.Date, nullable=False)
    jam = db.Column(db.Time, nullable=False)
    harga = db.Column(db.Integer, nullable=False)
    # status = db.Column(db.String, nullable=False)
    film_judul = db.Column(db.String, nullable=False)
    film_kategori = db.Column(db.String, nullable=False)
    film_durasi = db.Column(db.String(20), nullable=False)
    teater_nama = db.Column(db.String, nullable=False)
    teater_kapasitas = db.Column(db.Integer, nullable=False)
    film_id = db.Column(db.Integer, db.ForeignKey('film.id'), nullable=False)
    teater_id = db.Column(db.Integer, db.ForeignKey('teater.id'), nullable=False)
    transaksi_rel = db.relationship("Transaksi", backref="jadwal") #noted

class Transaksi(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    total_bayar = db.Column(db.Integer, nullable=False)
    jumlah_tiket = db.Column(db.Integer, nullable=False)
    user_username = db.Column(db.Text, nullable=False)
    jadwal_hari = db.Column(db.Date, nullable=False)
    jadwal_jam = db.Column(db.Time, nullable=False)
    jadwal_harga = db.Column(db.Integer, nullable=False)
    jadwal_film = db.Column(db.String, nullable=False)
    jadwal_kategori = db.Column(db.String, nullable=False)
    jadwal_durasi = db.Column(db.String(20), nullable=False)
    jadwal_teater = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    jadwal_id = db.Column(db.Integer, db.ForeignKey('jadwal.id'), nullable=False)

class Topup(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    saldo_history = db.Column(db.Integer, nullable=False)
    tanggal = db.Column(db.Date, nullable=False)
    pembayaran_metode = db.Column(db.String, nullable=False)
    nama_user = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    metode_id = db.Column(db.Integer, db.ForeignKey('metode.id'), nullable=False)

class Metode(db.Model):
    id = db.Column(db.Integer, primary_key=True, index=True)
    pembayaran = db.Column(db.String, nullable=False)
    topup_rel = db.relationship("Topup", backref="metode") #noted


# db.create_all()
# db.session.commit()


# ------------------------------------------- Basic Auth
def auth_user(auth):
    encode = base64.b64decode(auth[6:])
    str_encode = encode.decode('ascii')
    list = str_encode.split(':')
    username = list[0]
    password = list[1]
    user = User.query.filter_by(username=username).filter_by(password=password).first()
    if user :
        return str(user.id)
    else :
        return str(0)

def auth_admin_id(auth):
    encode = base64.b64decode(auth[6:])
    str_encode = encode.decode('ascii')
    list = str_encode.split(':')
    username = list[0]
    password = list[1]
    admin = Admin.query.filter_by(username=username).filter_by(password=password).first()
    if admin :
        return str(admin.id)
    else :
        return str(0)

def auth_admin(auth): # ----- auth admin tanpa id
    encode = base64.b64decode(auth[6:])
    str_encode = encode.decode('ascii')
    list = str_encode.split(':')
    username = list[0]
    password = list[1]
    admin = Admin.query.filter_by(username=username).filter_by(password=password).first()
    if not admin:
        return {
            'message': 'akeses ditolak !'
        }
    elif admin:
        return 'admin'

# @app.route('/login', methods=['POST'])
# @cross_origin(origin='*',headers=['Content-Type','Authorization'], supports_credentials=True)
# def login(): 

#--------------------- token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
                token = request.headers['Authorization']
        if not token:
                return jsonify({'message' : 'Token is missing !!'}), 401
        try:
                data = jwt.decode(token, app.config['SECRET_KEY'], algorithms="HS256")
                current_user = User.query.filter_by(id=data['user']).first()
        except:
                return jsonify({
                        'message' : 'Token is invalid !!'
                }), 401
        return  f(current_user,*args, **kwargs)
    return decorated

# ------------------------------------------- Admin
@app.route('/admin/',methods=['POST']) # ----- auth admin tanpa id
def post_admin():
    decode = request.headers.get('Authorization')
    allow = auth_admin(decode)
    if allow == 'admin':
        data = request.get_json()
        admin = Admin(
            nama=data['nama'],
            username=data['username'],
            password=data['password']
            )
        try :
            db.session.add(admin)
            db.session.commit()
            return {
                "message" : "sukses"
            },201
        except :
            return {
                "message" : "gagal"
            },400
    
    else:
        return {
            'message': 'akses ditolak selain admin !'
        }

@app.route('/admin/<id>',methods=['GET']) # ----- auth admin
def get_admin(id):
    decode = request.headers.get('Authorization')
    allow = auth_admin_id(decode)
    if allow == id :
        admin = Admin.query.filter_by(id=id).first()
        return jsonify ([
            {
            "nama" : admin.nama,
            "username" : admin.username,
            "password" : admin.password
            }
        ]),201
    else :
        return {
            'message' : 'akses ditolak!'
        },400

@app.route('/login/admin',methods=['POST']) # ----- auth admin // LOGIN.HTML
@cross_origin(supports_credentials=True)
def get_login_admin():
    decode = request.headers.get('Authorization')
    allow = auth_admin_id(decode)
    num_allow = int(allow)
    # return jsonify(allow)
    if num_allow != 0 :
       token = jwt.encode({
            'user': allow ,'exp' : datetime.utcnow() + timedelta(hours = 24)
        }, app.config['SECRET_KEY'])

       return jsonify({'token' : token})
    else :
        return {
            'message' : 'akses ditolak!'
        }, 400

@app.route('/admin/<id>',methods=['PUT']) # ----- auth admin
def update_admin(id):
    decode = request.headers.get('Authorization')
    allow = auth_admin_id(decode)
    if allow == id :
        data = request.get_json()
        admin = Admin.query.filter_by(id=id).first()
        admin.nama=data['nama'],
        admin.username=data['username'],
        admin.password=data['password']
        try:
            db.session.commit()
            return{
                "message" : "sukses"
            },201
        except :
            return{
                "message" : "gagal"
            },400
    else :
        return {
            'message' : 'akses ditolak!!'
        },400

@app.route('/admin/<id>',methods=['DELETE']) # ----- auth admin
def delete_admin(id):
    decode = request.headers.get('Authorization')
    allow = auth_admin_id(decode)
    if allow == id:
        admin = Admin.query.filter_by(id=id).first()
        try :
            db.session.delete(admin)
            db.session.commit()
            return {
                "message" : "sukses"
            },201
        except :
            return{
                "message" : "gagal"
            },500
    else :
        return {
            'message' : "akses ditolak!!!"
        }
        


# ------------------------------------------- User
@app.route('/user/',methods=['POST']) # ---- REGISTER
def post_user():
    data = request.get_json()
    user = User(
        nama=data['nama'],
        username=data['username'],
        password=data['password'],
        saldo=0
        )
    try :
        db.session.add(user)
        db.session.commit()
        return {
            "message" : "sukses"
        },201
    except : 
        return {
            "message" : "gagal"
        },400

@app.route('/user/<id>',methods=['GET']) # ----- auth user
def get_user_id(id):
    # decode = request.headers.get('Authorization')
    # allow = auth_user(decode)
    # if allow == id :
    
    user = User.query.filter_by(id=id).first()
    return jsonify ([
            {
            "nama": user.nama,
            "username": user.username,
            "password": user.password,
            "saldo": user.saldo
            }
        ]), 201
    # else :
    #     return {
    #         'message' : 'akses ditolak!'
    #     }, 400

@app.route('/login',methods=['POST']) # ----- auth user // LOGIN.HTML
@cross_origin(supports_credentials=True)
def get_user():
    decode = request.headers.get('Authorization')
    allow = auth_user(decode)
    num_allow = int(allow)
    # return jsonify(allow)
    if num_allow != 0 :
       token = jwt.encode({
            'user': allow ,'exp' : datetime.utcnow() + timedelta(hours = 24)
        }, app.config['SECRET_KEY'])
        # response = make_response( render_template() ) 
    #    response = make_response("Here, take some cookie!")
    #    response.headers["Set-Cookie"] = "myfirstcookie=somecookievalue"

       return jsonify({'token' : token})
#         return {"token" : token,
# "id" : int(allow)       
#        }
        # resp = make_response("token generated")
        # # resp.headers.add("Access-Control-Allow-Origin", "*")
        # # resp.headers.add("Access-Control-Allow-Headers", "*")
        # # resp.headers.add("Access-Control-Allow-Methods", "*")
        # resp.set_cookie('token',value=token,expires=datetime.now()+ dt.timedelta(hours=24),samesite='Lax', path='/')
        # return resp,201
        # return token
    # if allow != "0" :
        # user = User.query.filter_by(id=num_allow).first()
        # return {
        #     'message' : 'berhasil!'
        # },200
    else :
        return {
            'message' : 'akses ditolak!'
        }, 400

@app.route('/user',methods=['PUT']) # ----- auth user
@token_required
def update_user(current_user):
    # decode = request.headers.get('Authorization')
    # allow = auth_user(decode)
    # return str(id)
    # return str(current_user.id)
    data = request.get_json()
    user = User.query.filter_by(id=current_user.id).first()
    # if user:
    #     return str(user.id)
    if user:
        user.nama=data['nama'],
        user.username=data['username'],
        user.password=data['password'],
        try :
            db.session.commit()
            return {
                "message" : "sukses"
            },201
        except :
            return {
                "message" : "gagal"
            },400
    else :
        return {
            'message' : 'akses ditolak lagi!'
        }, 400

@app.route('/user/<id>',methods=['DELETE']) # ----- auth user
def delete_user(id):
    decode = request.headers.get('Authorization')
    allow = auth_user(decode)
    if allow == id:
        user = User.query.filter_by(id=id).first()
        try :
            db.session.delete(user)
            db.session.commit()
            return {
                "message" : "sukses"
            },201
        except :
            return{
                "message" : "gagal"
            },500
    else :
        return {
            'message' : 'akses ditolak lagi-lagi!'
        }


# ------------------------------------------- Film
@app.route('/film/',methods=['GET'])
def get_film():
    return jsonify ([
        {
            "id" : film.id,
           "judul": film.judul,
           "film_kategori" : film.film_kategori,
           "deskripsi": film.deskripsi,
           "rating": film.rating,
            "image" : film.image,
           "produksi": film.produksi,
           "durasi": film.durasi,
           "country": film.country
           } for film in Film.query.all()
    ]), 201

@app.route('/film/<id>',methods=['GET']) 
def get_film_id(id):
    film = Film.query.filter_by(id=id).first()
    # return str(film)
    return jsonify ([
        {
           "judul": film.judul,
           "film_kategori" : film.film_kategori,
           "deskripsi": film.deskripsi,
           "image" : film.image,
           "rating": film.rating,
           "produksi": film.produksi,
           "durasi": film.durasi,
           "country": film.country
           }
    ]), 201


@app.route('/film/',methods=['POST']) # ----- auth film
def post_film():
    decode = request.headers.get('Authorization')
    allow = auth_admin(decode)
    if allow == 'admin':
        data = request.get_json()
        kategori = Kategori.query.filter_by(kategori_film=data['film_kategori']).first()
        if not kategori:
            return {
                'message' : 'kategori harus dimasukkan !'
            }
        film = Film(
            judul=data['judul'],
            kategori_id=kategori.id,
            film_kategori=data['film_kategori'],
            deskripsi=data['deskripsi'],
            rating=data['rating'],
            produksi=data['produksi'],
            durasi=data['durasi'],
            country=data['country'],
            image=data['image']
        )
        try:
            db.session.add(film)
            db.session.commit()
            return {
                "message" : "sukses"
            }, 201
        except : 
            return {
                "message" : "gagal"
            },400
    else:
        return {
            'message': 'akses ditolak selain admin !'
        }

@app.route('/film/<id>',methods=['PUT']) # ----- auth film
def update_film(id):
    decode = request.headers.get('Authorization')
    allow = auth_admin(decode)
    if allow == 'admin':
        data = request.get_json()
        film = Film.query.filter_by(id=id).first()
        film.judul=data['judul'],
        film.film_kategori=data['film_kategori']
        film.deskripsi=data['deskripsi'],
        film.rating=data['rating'],
        film.produksi=data['produksi'],
        film.durasi=data['durasi'],
        film.country=data['country'],
        film.image=data['image']
        try :
            db.session.commit()
            return {
                "message" : "sukses"
            },201
        except :
            return {
                "message" : "gagal"
            },400
    else :
        return {
            'message' : 'akses ditolak lagi!'
        }, 400

@app.route('/film/<id>',methods=['DELETE']) # ----- auth film
def delete_film(id):
    decode = request.headers.get('Authorization')
    allow = auth_admin(decode)
    if allow == 'admin':
        film = Film.query.filter_by(id=id).first()
        try :
            db.session.delete(film)
            db.session.commit()
            return {
                "message" : "sukses"
            },201
        except :
            return{
                "message" : "gagal"
            },500
    else :
        return {
            'message' : 'akses ditolak!'
        }        


# ------------------------------------------- Kategori
@app.route('/kategori/',methods=['GET'])
def get_kategori():
    return jsonify ([
        {
            "kategori_film" : kategori.kategori_film
        } for kategori in Kategori.query.all()
    ]), 201

@app.route('/kategori/',methods=['POST']) # ----- auth kategori
def post_kategori():
    decode = request.headers.get('Authorization')
    allow = auth_admin(decode)
    if allow == 'admin':
        data = request.get_json()
        kategori = Kategori(
            kategori_film=data['kategori_film']
        )
        try:
            db.session.add(kategori)
            db.session.commit()
            return {
            "message" : "sukses"
            }, 201
        except :
            return {
                "message" : "gagal"
            }, 400
    else :
        return {
            'message' : 'akses ditolak selain admin !'
        }

@app.route('/kategori/<id>',methods=['PUT']) # ----- auth kategori
def update_kategori(id):
    decode = request.headers.get('Authorization')
    allow = auth_admin(decode)
    if allow == 'admin':
        data = request.get_json()
        kategori = Kategori.query.filter_by(id=id).first()
        kategori.kategori_film=data['kategori_film']
        try :
            db.session.commit()
            return {
                "message" : "sukses"
            },201
        except : 
            return {
                "message" : "gagal"
            },400
    else :
        return {
            'message' : 'akses ditolak lagi!'
        }, 400

@app.route('/kategori/<id>',methods=['DELETE']) # ----- auth kategori, delete w/film
def delete_kategori(id):
    decode = request.headers.get('Authorization')
    allow = auth_admin(decode)
    if allow == 'admin' :
        kategori = Kategori.query.filter_by(id=id).first()
        try:
            db.session.delete(kategori)
            db.session.commit()
            return {
                "message" : "sukses"
            },201
        except :
            return {
                "message" : "gagal"
            },500
    else :
        return {
            'message' : 'akses ditolak!'
        }


# ------------------------------------------- Teater
@app.route('/teater/',methods=['GET'])
def get_teater():
    return jsonify([
        {
            "nama": teater.nama,
            "kapasitas" : teater.kapasitas   
        } 
        for teater in Teater.query.all()
    ]), 201

@app.route('/teater/',methods=['POST']) # ----- auth teater
def post_teater():
    decode = request.headers.get('Authorization')
    allow = auth_admin(decode)
    if allow == 'admin':
        data = request.get_json()
        teater = Teater(
            nama=data['nama'],
            kapasitas=data['kapasitas']
        )
        try:
            db.session.add(teater)
            db.session.commit()
            return {
                "message" : "sukses"
            }, 201
        except : 
            return {
                "message" : "gagal"
            },400
    else :
        return {
            'message' : 'akses ditolak selain admin !'
        }

@app.route('/teater/<id>',methods=['PUT']) # ----- auth teater
def update_teater(id):
    decode = request.headers.get('Authorization')
    allow = auth_admin(decode)
    if allow == 'admin':
        data = request.get_json()
        teater = Teater.query.filter_by(id=id).first()
        teater.nama=data['nama'],
        teater.kapasitas=data['kapasitas']
        try :
            db.session.commit()
            return {
                "message" : "sukses"
            },201
        except :
            return {
                "message" : "gagal"
            },400
    else :
        return {
            'message' : 'akses ditolak selain admin'
        }



# ------------------------------------------- Jadwal
@app.route('/film/cari',methods=['POST']) # ---- Search Film
def cari_film():
    list = []
    data = request.get_json()
    result = db.engine.execute(f'''SELECT jadwal.*FROM jadwal WHERE film_judul ILIKE '{data['film_judul']}%%'ORDER BY id''')
    for i in result:
        if i:
            list.append(
                {
                  "id" : i.id,
                  "jam": i.jam.strftime("%H:%M"),
                  "hari": i.hari.strftime("%A"),
                  "teater_kapasitas" : i.teater_kapasitas,
                  "film_judul" : i.film_judul,
                  "teater_nama" : i.teater_nama
                }
            )
    return jsonify(list)

@app.route('/jadwal/',methods=['POST']) # ----- auth teater
def post_jadwal():
    decode = request.headers.get('Authorization')
    allow = auth_admin(decode)
    if allow == 'admin':
        data = request.get_json()
        teater = Teater.query.filter_by(nama=data['nama']).first()
        if not teater:
            return {
                'message': 'nama teater harus'
            }

        film = Film.query.filter_by(judul=data['judul']).first()
        if not film:
            return{
                'message': 'judul film kosong'
            }
    
        jadwal = Jadwal(
            hari=data['hari'],
            jam =data['jam'],
            harga=data['harga'],
            film_id=film.id,
            film_judul=film.judul,
            film_kategori=film.film_kategori,
            film_durasi=film.durasi,
            teater_nama=teater.nama,
            teater_kapasitas=teater.kapasitas,
            teater_id=teater.id,
            # status= "sedang tayang"
            )
        try :
            db.session.add(jadwal)
            db.session.commit()
            return {
                "message" : "sukses"
            },201
        except : 
            return {
                "message" : "gagal"
            },400
    else :
        return {
            'message' : 'akses ditolak selain admin !'
        }

@app.route('/jadwal/',methods=['GET']) # ----- fixed
def get_jadwal():
    result = db.engine.execute(f'''SELECT * FROM jadwal WHERE hari >= '%%{datetime.today()}%%' OR hari >= '%%{datetime.today()}%%'  AND jam > '%%{datetime.now()}%%' ORDER BY hari desc ''')
    lst = []
    for x in result:
        if x:
            film = Film.query.filter_by(id=x.film_id).first()
            lst.append(
                {
                    "id" : x.id,
                    "film_id" : x.film_id,
                    "hari" : x.hari.strftime("%d-%m-%Y"),
                    "jam": x.jam.strftime("%H:%M"),
                    "harga": x.harga,
                    "image" : film.image,
                    # "status" : x.status,
                    "teater_nama": x.teater_nama,
                    "film_judul" : x.film_judul,
                    "film_kategori" : x.film_kategori,
                    "film_durasi" : x.film_durasi
                }
            )

    return jsonify(lst)
        
@app.route('/jadwal/<id>',methods=['PUT']) # ----- auth teater
def update_jadwal(id):
    decode = request.headers.get('Authorization')
    allow = auth_admin(decode)
    if allow == 'admin':
        data = request.get_json()
        jadwal = Jadwal.query.filter_by(id=id).first()
        jadwal1 = Jadwal.query.filter_by(teater_nama=data['teater_nama']).first()
        jadwal2 = Jadwal.query.filter_by(film_judul=data['film_judul']).first()
        jadwal.teater_id= jadwal1.teater.id,
        jadwal.teater_nama=jadwal.teater.nama,
        jadwal.film_id=jadwal2.id,
        jadwal.film_judul=jadwal.film.judul,
        jadwal.film_film_kategori=jadwal.film.film_kategori,
        jadwal.film_durasi=jadwal.film.durasi,
        jadwal.hari=data['hari'],
        jadwal.jam=data['jam'],
        jadwal.harga=data['harga'],
        try :
            db.session.commit()
            return {
                    "message" : "sukses"
                },201
        except :
            return {
                    "message" : "gagal"
                },400
    else :
        return {
            'message' : 'akses ditolak lagi!'
        }, 400

@app.route('/jadwal/<id>',methods=['DELETE']) # ----- auth teater
def delete_jadwal(id):
    decode = request.headers.get('Authorization')
    allow = auth_admin(decode)
    if allow == 'admin':
        try :
            jadwal = Jadwal.query.filter_by(id=id).first()
            teater = Teater.query.filter_by(id=jadwal.teater_id).first()
            if jadwal.teater_kapasitas < teater.kapasitas:
                return {
                    'message': 'kasian konsumen yang udah beli bang!'
                }
            else:
                db.session.delete(jadwal)
                db.session.commit()
                return{
                    "message" : "sukses"
                },201
        except :
            return{
                "message" : "gagal"
            }
    else :
        return {
            'message' : 'akses ditolak!'
        }


# ------------------------------------------- Transaksi
@app.route('/transaksi/<id>',methods=['POST']) # ----- auth transaksi
@token_required
def post_transaksi(current_user, id):
    # decode = request.headers.get('Authorization')
    # allow = auth_user(decode)
    user = User.query.filter_by(id=current_user.id).first()
    if user:
        data = request.get_json()
        jadwal = Jadwal.query.filter_by(film_id=id).first()
        if not jadwal:
            return{
                'message': 'judul film kosong'
            }
        transaksi = Transaksi(
            total_bayar=data['jumlah_tiket'] * jadwal.harga,
            jumlah_tiket=data['jumlah_tiket'],
            user_username=user.username,
            user_id=user.id,
            jadwal_id=jadwal.id,
            jadwal_hari=jadwal.hari,
            jadwal_jam=jadwal.jam,
            jadwal_harga=jadwal.harga,
            jadwal_film=jadwal.film_judul,
            jadwal_kategori=jadwal.film_kategori,
            jadwal_durasi=jadwal.film_durasi,
            jadwal_teater=jadwal.teater_nama
            )
        if transaksi.total_bayar > user.saldo :
            return {
                'message' : 'om kurang'
            }
        if transaksi.jumlah_tiket > jadwal.teater_kapasitas :
            return {
                'message' : 'kursi penuh'
            }
        try :
            user.saldo -= transaksi.total_bayar
            jadwal.teater_kapasitas -= transaksi.jumlah_tiket
            db.session.add(transaksi)
            db.session.commit()
            return {
                "message" : "sukses"
            },201
        except : 
            return {
                "message" : "gagal"
            },400
    else :
        return {
            'message' : 'akses ditolak !'
        },400


@app.route('/transaksi/',methods=['GET']) # ----- auth transaksi - GET data ALL transaksi
@token_required
def get_transaksi(current_user):
    # decode = request.headers.get('Authorization')
    # allow = auth_user(decode)
    # user = User.query.filter_by(id=allow).first()
    if current_user:
        return jsonify([
            {
                "total_bayar" : transaksi.total_bayar,
                "jumlah_tiket" : transaksi.jumlah_tiket,
                "username" : transaksi.user.username,
                "jadwal_hari": transaksi.jadwal_hari.strftime("%A" + "," + str(transaksi.jadwal_hari)[:16]),
                "jadwal_jam": transaksi.jadwal_jam.strftime("%H:%M"),
                "jadwal_harga": transaksi.jadwal_harga,
                "jadwal_film" : transaksi.jadwal_film,
                "jadwal_kategori" : transaksi.jadwal_kategori,
                "jadwal_durasi" :transaksi.jadwal_durasi,
                "jadwal_teater" : transaksi.jadwal_teater
            } for transaksi in Transaksi.query.order_by(Transaksi.id.desc()).filter_by(user_id=current_user.id).all()
        ]), 201
    else :
        return {
            "message" : 'akses ditolak !'
        },400

@app.route('/transaksi/film/active',methods=['GET']) # ----- fixed ----- auth transaksi - GET data film active
def get_filmActive():
    decode = request.headers.get('Authorization')
    allow = auth_user(decode)
    result = db.engine.execute(f'''SELECT * FROM transaksi WHERE user_id ='{allow}' AND jadwal_hari >= '%%{datetime.today()}%%' AND jadwal_jam > '%%{datetime.now()}%%' ORDER BY jadwal_hari desc ''' )
    list = []
    for i in result:
        if i:
            list.append(
                {
                    "total_bayar" : i.total_bayar,
                    "jumlah_tiket" : i.jumlah_tiket,
                    "username" : i.user_username,
                    "jadwal_hari": i.jadwal_hari.strftime("%A" + "," + str(i.jadwal_hari)[:16]),
                    "jadwal_jam": i.jadwal_jam.strftime("%H:%M"),
                    "jadwal_harga": i.jadwal_harga,
                    "jadwal_film" : i.jadwal_film,
                    "jadwal_kategori" : i.jadwal_kategori,
                    "jadwal_durasi" :i.jadwal_durasi,
                    "jadwal_teater" : i.jadwal_teater 
                }
            )
    return jsonify(list)
    
@app.route('/transaksi/reporting',methods=['GET']) # ----- reporting
def reporting_topFive():
    result = db.engine.execute(f'''SELECT jadwal_id,jadwal_film, SUM(jumlah_tiket) AS jumlah_tiket FROM transaksi GROUP BY jadwal_id,jadwal_film ORDER BY jumlah_tiket DESC LIMIT 5''')
    lst = []
    for i in result:
        if i:
            lst.append(
                {
                    "jumlah_tiket" : i.jumlah_tiket,
                    "jadwal_film" : i.jadwal_film
                }
            )
    return jsonify(lst)
    

# ------------------------------------------- Top Up
@app.route('/user/topup',methods=['POST']) # ----- auth user/topup
@token_required
def post_topup(current_user):
    # decode = request.headers.get('Authorization')
    # allow = auth_user(decode)
    # user = User.query.filter_by(id=allow).first()
    if current_user :
        data = request.get_json()
        if (int(data['saldo_history'])) < 10000 :
            return {
                "message" : "minimal top up 10000 ya"
            }, 400
        # metode = Metode.query.filter_by(pembayaran=data['pembayaran_metode']).first()
        # if not metode:
        #     return{
        #         'message': 'pilihlah metodenya'
        #     }
        today = date.today()
        topup = Topup(
            saldo_history = data['saldo_history'],
            tanggal = today,
            nama_user=current_user.nama,
            pembayaran_metode = "Transfer",
            user_id=current_user.id,
            metode_id= 1
        )
        try :
            current_user.saldo += int(topup.saldo_history)
            db.session.add(topup)
            db.session.commit()
            return {
                "message" : "sukses"
            },201
        except :
            return {
                "message" : "gagal"
            }
    else :
        return {
            'message' : 'akses ditolak !'
        }

@app.route('/user/topup/',methods=['GET']) # ----- auth user/topup
def get_topup():
    decode = request.headers.get('Authorization')
    allow = auth_user(decode)
    user = User.query.filter_by(id=allow).first()
    if user :
        return jsonify([
            {
                "saldo_history" : topup.saldo_history,
                "tanggal" : topup.tanggal,
                "nama_user" : topup.nama_user,
                "pembayaran_metode" : topup.pembayaran_metode,
            } for topup in Topup.query.order_by(Topup.id.desc()).filter_by(user_id=user.id).all()
        ]),201
 
    else :
        return {
            'message' : 'akses ditolak, tidak bisa topup!'
        },400


# ------------------------------------------- Metode
@app.route('/metode/',methods=['GET'])
def get_metode():
        return jsonify([
            {
                "pembayaran" : metode.pembayaran
            } for metode in Metode.query.all()
        ]),201

@app.route('/metode/',methods=['POST']) # ----- auth metode
def post_metode():  
    decode = request.headers.get('Authorization')
    allow = auth_admin(decode)
    if allow == 'admin' :
        data = request.get_json()
        metode = Metode(
            pembayaran=data['pembayaran']
        )
        try :
            db.session.add(metode)
            db.session.commit()
            return {
                "message" : "sukses"
            },201
        except :
            return {
                "message" : "gagal"
            },400
    else :
        return {
            'message' : 'akses ditolak !'
        }
        
