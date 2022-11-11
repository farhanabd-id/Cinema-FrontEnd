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

// LOGIN ADMIN
const formLoginAdmin = document.getElementById("form-loginadmin")
formLoginAdmin.addEventListener('submit', (e) => {
    e.preventDefault()
    const x = document.getElementById("user").value
    const y = document.getElementById("pass").value

    if (x == "" || y == "") {
        alert('USER AND PASS REQUIRMENT !')
    } else {
        credentials = btoa(`${x}:${y}`)

        fetch("http://127.0.0.1:5000/login/admin", {
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
                    window.location.href = '/login/dist/loginadmin.html'
                }
                // console.log(JSON.parse(result))

                // else{document.cookie = "token=" + result.token + "; expires=Thu, 18 Dec 2023 12:00:00 UTC; path=/";
                else{document.cookie = "token_admin=" + result.token + "; expires=Thu, 18 Dec 2023 12:00:00 UTC; path=/";
                window.location.href = '../../NiceAdmin/index.html'}
            })
            .catch(error => console.log('error', error));


    }
})