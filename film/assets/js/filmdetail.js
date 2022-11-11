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

let url_string = window.location.href; // GET URL
let url = new URL(url_string); // Return URL and GET Parameters From URL
// console.log(url)
let id = url.searchParams.get("fid"); // GET ID BY URL Berdasarkan Parameter
const title = document.getElementById("title")
const genre = document.getElementById("genre")
const durasi = document.getElementById("durasi")
const desc = document.getElementById("desc")
const country = document.getElementById("country")
const rating = document.getElementById("rating")
const produksi = document.getElementById("produksi")
const image = document.getElementById("image")
const title_header = document.getElementById("title-header")

fetch('http://127.0.0.1:5000/film/'+id, {
  method: 'GET',
//   credentials: 'include',
})
.then(response => response.json())
.then(json => {
  console.log(json)
  title.innerHTML = json[0].judul
  genre.innerHTML = json[0].film_kategori
  durasi.innerHTML = json[0].durasi
  desc.innerHTML = json[0].deskripsi
  country.innerHTML = json[0].country
  rating.innerHTML = json[0].rating
  produksi.innerHTML = json[0].produksi
  image.src = json[0].image
  title_header.innerHTML = json[0].judul
})
// .then(result => {
//   document.getElementById("image").innerHTML += `<figure id="img" class="movie-detail-banner">
//   <img id="image" src="${result[0].image}" alt="Free guy movie poster">
//   </figure>`
// })
.catch((error) => {
  alert('Error:'+ error);
});



function buyticket() {
        let url_string = window.location.href; // GET URL
        let url = new URL(url_string); // Return URL and GET Parameters From URL
        // console.log(url)
        let id = url.searchParams.get("fid"); // GET ID BY URL Berdasarkan Parameter
        console.log(id)
        const token = getCookie('token_user');
        console.log(token)
        const ammount = document.getElementById("ammount").value
        var raw = JSON.stringify({
            "jumlah_tiket": parseInt(ammount)
        });
    
        var requestOptions = {
            method: 'POST',
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: raw,
            redirect: 'follow'
        };
    
        fetch("http://127.0.0.1:5000/transaksi/"+id, requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log(result)
                if(result.message == 'om kurang'){
                    alert('user cannot buy if saldo is not sufficient')
                    location.reload();
                }
                if(result.message == "sukses")
                {
                    alert('buy ticket success! ENJOY! :)')
                    location.reload();
                }
            })
            .catch(error => console.log('error', error));
    }