var requestOptions = {
    method: 'GET',
    redirect: 'follow'
};

fetch("http://127.0.0.1:5000/jadwal/", requestOptions)
    .then(response => response.json())
    .then(result => {
        console.log(result)
        for (let i = 0; i < result.length; i++) {
            document.getElementById("movie-list").innerHTML += `<li>
            <div class="movie-card">

                <figure class="card-banner">
                  <img src="${result[i].image}" alt="Sonic the Hedgehog 2 movie poster">
                </figure>

              <p>
                  <h3 class="card-title mb-0" style="cursor: pointer;">${result[i].teater_nama}</h3>
                </p>
              <div class="title-wrapper">

                <a href="/film/movie-details.html?fid=${result[i].film_id}" onclick="filmdetail(id)" style="text-decoration:none;">
                  <h3 class="card-title">${result[i].film_judul}</h3>
                </a>

                <time datetime="2022">${result[i].harga}</time>
              </div>

              <div class="card-meta">
                <div class="badge badge-outline">${result[i].film_kategori}</div>

                <div class="duration">
                  <ion-icon name="time-outline"></ion-icon>

                  <time datetime="PT122M">${result[i].film_durasi}</time>
                </div>

                <div class="rating">
                  <ion-icon name="star"></ion-icon>

                  <data>${result[i].jam}</data>
                </div>

                <div class="rating">
                  <ion-icon name="star"></ion-icon>

                  <data>${result[i].hari}</data>
                </div>

                
              </div>

            </div>
          </li>`
        }
    })
    .catch(error => console.log('error', error));

    const formatRupiah = (money) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(money);
    }

    // function getUser() {
    //     const token = document.cookie;
    //     const split = token.split(".");
    //     let user = JSON.parse(atob(split[1]));
    //     let userid = user["user"]
    //     const name = document.getElementById("inputName")
    //     const username = document.getElementById("inputUname")
    //     const password = document.getElementById("inputPassword")
    //     var requestOptions = {
    //         method: 'GET',
    //     };
    
    //     fetch("http://127.0.0.1:5000/user/" + userid, requestOptions)
    //         .then(response => response.json())
    //         .then(result => {
    //             // localStorage.setItem("udata",JSON.stringify(result))
    //             console.log(result)
    //             document.getElementById('user-topup').innerHTML = result[0].nama
    //             document.getElementById('user-saldo').innerHTML = 'Saldo : ' + formatRupiah(result[0].saldo)
    //             name.value = result[0].nama,
    //                 username.value = result[0].username
    //         })
    //         .catch(error => console.log('error', error));
    // }

    /**
 * header sticky
 */

const header = document.querySelector("[data-header]");

window.addEventListener("scroll", function () {

  window.scrollY >= 10 ? header.classList.add("active") : header.classList.remove("active");

});



/**
 * go top
 */

const goTopBtn = document.querySelector("[data-go-top]");

window.addEventListener("scroll", function () {

  window.scrollY >= 500 ? goTopBtn.classList.add("active") : goTopBtn.classList.remove("active");

});

    document.addEventListener("DOMContentLoaded", () => {
        getUser()
    } );


    
      