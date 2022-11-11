const formatRupiah = (money) => { 
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(money);
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

function topup() {
    const topup = document.getElementById("ammount").value
    const token = getCookie('token_user')
    // console.log(token)
    // const split = token.split(".");
    // let user = JSON.parse(atob(split[1]));

    var raw = JSON.stringify({
        "saldo_history": topup
    });

    var requestOptions = {
        method: 'POST',
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        },
        body: raw
        // redirect: 'follow'
    };

    fetch("http://127.0.0.1:5000/user/topup", requestOptions)
        .then(response => response.json())
        .then(result => {
            if(result.message == 'sukses'){
                alert("Success top up silahkan beli film!")
                window.location.reload()
            }
            if(result.message == 'minimal top up 10000 ya'){
                alert('min topup 10.000')
                window.location.reload()
            }
        })
        .catch(error => console.log('error', error));
}



function buymovie() {
    if (document.cookie.length == 0) {
        alert('Silahkan Login dulu')
        window.location.href = '/login/dist/login.html'
    } else {
        alert('Silahkan Pilih Film dulu')
        window.location.href = '../../film/movie.html'
    }
}

function movie() {
    if (document.cookie.length == 0) {
        alert('Silahkan Login dulu')
        window.location.href = '/login/dist/login.html'
    }
    else{
        window.location.href = '/film/movie.html'
    }
}

function topupbtn() {
    if (document.cookie.length == 0) {
        alert('Silahkan Login dulu')
        window.location.href = '/login/dist/login.html'
    }
    else{
        window.location.href = '/film/movie.html'
    }
}

function filmDetail(id) {
    window.location.href = '../../movie-details.html?fid=' + id
}

// SEARCH
function myFunction() {

    // Declare variables
    let input, filter, ul, li;
    input = document.getElementById('myInput');
    const inputValue = document.getElementById('myInput').value;
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName('li');

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "film_judul": inputValue
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
    };

    fetch("http://127.0.0.1:5000/film/cari", requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(result)
        })
        .catch(error => console.log('error', error));
    
}

function updateuser() {
    const name = document.getElementById("inputName").value
    const username = document.getElementById("inputUname").value
    const password = document.getElementById("inputPassword").value
    console.log(name,username, password)
    const token = getCookie('token_user')
    const split1 = token.split("token=");
    console.log(split1[1])

    var raw = JSON.stringify({
        "nama": name,
        "username": username,
        "password": password
    });


    var requestOptions = {
        method: 'PUT',
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        },
        body: raw,
        redirect: 'follow'
    };

    fetch("http://127.0.0.1:5000/user", requestOptions)
        .then(response => response.json())
        .then(result => {
            if(result.message == 'sukses'){
                alert("Success update data")
                window.location.reload()
            }
        })
        .catch(error => console.log('error', error));
}


function getfilmdetail(id) {

    const desc = document.getElementById("desc")
    const duration = document.getElementById("duration")
    const category = document.getElementById("category")
    const rating = document.getElementById("rating")
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch("http://127.0.0.1:5000/film/" + id, requestOptions)
        .then(response => response.json())
        .then(result => {
            desc.value = result[0].deskripsi
            duration.value = result[0].durasi
            category.value = result[0].film_kategori
            rating.value = result[0].rating
            // console.log(result)
        })
        .catch(error => console.log('error', error));
}

function getUser() {

    const token = getCookie('token_user')
    // console.log(token)
    const split = token.split(".");
    let user = JSON.parse(atob(split[1]));
    // console.log(user['user'])
    let userid = user["user"]
    const name = document.getElementById("inputName")
    const username = document.getElementById("inputUname")
    var requestOptions = {
        method: 'GET',
    };

    fetch("http://127.0.0.1:5000/user/" + userid, requestOptions)
        .then(response => response.json())
        .then(result => {
            // localStorage.setItem("udata",JSON.stringify(result))
            console.log(result)
            document.getElementById('user-topup').innerHTML = result[0].nama
            document.getElementById('user-saldo').innerHTML = 'Saldo : ' + formatRupiah(result[0].saldo)
            document.getElementById('inputName').value = result[0].nama
            document.getElementById('inputUname').value = result[0].username
            document.getElementById('inputPassword').value = result[0].password
            name.value = result[0].nama,
            username.value = result[0].username
        })
        //   .then(result => localStorage.setItem("udata",JSON.stringify(result)))
        .catch(error => console.log('error', error));
}

// LOGIN USER
const formLogin = document.getElementById("form-login")
formLogin.addEventListener('submit', (e) => {
    e.preventDefault()
    const x = document.getElementById("user").value
    const y = document.getElementById("pass").value

    if (x == "" || y == "") {
        alert('USER AND PASS REQUIRMENT !')
    } else {
        credentials = btoa(`${x}:${y}`)

        fetch("http://127.0.0.1:5000/login", {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Authorization': `Basic ${credentials}`
                },
            })
            .then(response => response.json())
            .then(result => {
                console.log(result)
                if (result.message === "akses ditolak!") {
                    alert("login gagal!")
                    window.location.href = '/login/dist/login.html'
                    
                }

                // console.log(JSON.parse(result))
                // else{document.cookie = "token=" + result.token + "; expires=Thu, 18 Dec 2023 12:00:00 UTC; path=/"; //token_user
                else{document.cookie = "token_user=" + result.token + "; expires=Thu, 18 Dec 2023 12:00:00 UTC; path=/"; //token_user
                window.location.href = '../../film/index.html'}
            })
            .catch(error => console.log('error', error));


    }
})

function logout() {
    document.cookie = "token_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // localStorage.removeItem("udata")
    window.location.href = '/login/dist/login.html'

}

