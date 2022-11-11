// REPORTING

var requestOptions = {
  method: 'GET',
  redirect: 'follow'
};

fetch("http://127.0.0.1:5000/transaksi/reporting", requestOptions)
  .then(response => response.json())
  .then(result => {
    console.log(result)
    for (let i = 0; i < result.length; i++) {
      document.getElementById("reporting").innerHTML +=
        `<tr>
            <th scope="row"><a href="#">${i+1}</a></th>
            <td><a href="#" class="text-primary fw-bold">${result[i].jadwal_film}</a></td>
            <td>${result[i].jumlah_tiket}</td>
          </tr>`
    }
  })
  .catch(error => console.log('error', error));

// CREATE NEW MOVIE

var requestOptions = {
  method: 'GET',
  redirect: 'follow'
};

fetch("http://127.0.0.1:5000/film/", requestOptions)
  .then(response => response.json())
  .then(result => {
    console.log(result)
    for (let i = 0; i < result.length; i++) {
      document.getElementById("create").innerHTML +=
        `<tr>
          <th scope="row"><a href="#">${i+1}</a></th>
          <td><a href="#" class="text-primary fw-bold">${result[i].judul}</a></td>
          <td>${result[i].film_kategori}</td>
          <td> <button class="btn btn-warning" onclick="editmovie('${result[i].id}','${result[i].film_kategori}','${result[i].judul}','${result[i].deskripsi}','${result[i].rating}','${result[i].produksi}','${result[i].durasi}','${result[i].country}','${result[i].image}')" data-bs-target="#modalEditMovie"> edit </button> <button class="btn btn-danger" onclick="deletemovie(${result[i].id})"> delete </button> </td>
        </tr>`
    }
  })
  .catch(error => console.log('error', error));

function editmovie(id, fk, judul, desc, rating, produksi, durasi, country, img) {
  $('#modalEditMovie').modal('show');
  let title = document.getElementById("titlemovieedit")
  let category = document.getElementById("categorymovieedit")
  let rate = document.getElementById("ratingmovieedit")
  let descript = document.getElementById("descmovieedit")
  let production = document.getElementById("productionmovieedit")
  let duration = document.getElementById("durationmovieedit")
  let negara = document.getElementById("countrymovieedit")
  let image = document.getElementById("imagemovieedit")
  title.value = judul
  category.value = fk
  rate.value = rating
  descript.value = desc
  production.value = produksi
  duration.value = durasi
  negara.value = country
  image.value = img

  document.getElementById('btnUpdateMovie').setAttribute('onclick', 'updateMovie('+id+')')

}

function updateMovie(id){
  let title = document.getElementById("titlemovieedit").value
  let category = document.getElementById("categorymovieedit").value
  let rate = document.getElementById("ratingmovieedit").value
  let descript = document.getElementById("descmovieedit").value
  let production = document.getElementById("productionmovieedit").value
  let duration = document.getElementById("durationmovieedit").value
  let negara = document.getElementById("countrymovieedit").value
  let image = document.getElementById("imagemovieedit").value
  console.log(title, category, rate, descript, production, duration, negara, image)

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtX2Zhcmhhbjox");
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    "judul": title,
    "film_kategori": category,
    "deskripsi": descript,
    "rating": parseInt(rate),
    "produksi": production,
    "durasi": duration,
    "country": negara,
    "image": image
  });

  var requestOptions = {
    method: 'PUT',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("http://127.0.0.1:5000/film/" + id, requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

}

function deletemovie(id) {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtX2Zhcmhhbjox");

  var requestOptions = {
    method: 'DELETE',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch("http://127.0.0.1:5000/film/" + id, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result)
      if (result.message == 'sukses') {
        alert("Success Delete Movie")
        location.reload()
      }
    })
    .catch(error => console.log('error', error));
}

function createmovie() {
  const title = document.getElementById("titlemovie").value
  const category = document.getElementById("categorymovie").value
  const rating = document.getElementById("ratingmovie").value
  const desc = document.getElementById("descmovie").value
  const production = document.getElementById("productionmovie").value
  const duration = document.getElementById("durationmovie").value
  const country = document.getElementById("countrymovie").value
  const image = document.getElementById("imagemovie").value
  // console.log(title, category, rating, desc, production, duration, country)
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtX2Zhcmhhbjox");
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    "judul": title,
    "deskripsi": desc,
    "film_kategori": category,
    "rating": parseInt(rating),
    "produksi": production,
    "durasi": parseInt(duration),
    "country": country,
    "image": image
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("http://127.0.0.1:5000/film/", requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result)
      if (result.message == 'sukses') {
        alert("Success Create New Movie")
        location.reload()
      }
    })
    .catch(error => console.log('error', error));

}

// ADD MOVIE

var requestOptions = {
  method: 'GET',
  redirect: 'follow'
};


fetch("http://127.0.0.1:5000/jadwal/", requestOptions)
  .then(response => response.json())
  .then(result => {
    console.log(result)
    for (let i = 0; i < result.length; i++) {
      document.getElementById("addmovie").innerHTML +=
        `<tr>
            <th scope="row"><a href="#">${i+1}</a></th>
            <td><a href="#" class="text-primary fw-bold">${result[i].film_judul}</a></td>
            <td>${result[i].hari}</td>
            <td> <button class="btn btn-warning" onclick="editmovieschedule('${result[i].id}','${result[i].film_judul}','${result[i].harga}','${result[i].hari}','${result[i].jam}','${result[i].teater_nama}')"> edit </button> <button class="btn btn-danger" onclick="deletemovieschedule(${result[i].id})"> delete </button> </td>
          </tr>`
    }
  })
  .catch(error => console.log('error', error));

function editmovieschedule(id, fj, hrg, hari, jam, tnama) {
  $('#modalEditMovieSchedule').modal('show');
  // console.log(id, fk, fj, hrg, hari, jam, fdurasi, tnama, img)
  let date = document.getElementById("inputDateEdit")
  let hour = document.getElementById("inputHourEdit")
  let price = document.getElementById("inputPriceEdit")
  let filmtitle = document.getElementById("inputTitleEdit")
  let namateater = document.getElementById("inputTeaterEdit")

  date.value = hari
  hour.value = jam
  price.value = hrg
  filmtitle.value = fj
  namateater.value = tnama
  console.log(hari)

  document.getElementById("updateSchedule").setAttribute('onclick', 'updateScheduleMovie('+id+')')
}

function updateScheduleMovie(id) {

  let date = document.getElementById("inputDateEdit")
  let hour = document.getElementById("inputHourEdit")
  let price = document.getElementById("inputPriceEdit")
  let filmtitle = document.getElementById("inputTitleEdit")
  let namateater = document.getElementById("inputTeaterEdit")

  var myHeaders = new Headers();
    myHeaders.append("Authorization", "Basic YWRtX2Zhcmhhbjox");
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      "hari": date.value,
      "jam": hour.value,
      "harga": price.value,
      "film_judul": filmtitle.value,
      "teater_nama": namateater.value
    });

    var requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: raw,
    };

    fetch("http://127.0.0.1:5000/jadwal/" + id, requestOptions)
      .then(response => response.json())
      .then(result => {console.log(result)
        if (result.message == 'sukses') {
          alert("Success Update Movie Schedule")
          location.reload()
        }})
      .catch(error => console.log('error', error));
}

function addmovie() {
  const date = document.getElementById("inputDate").value
  const hour = document.getElementById("inputHour").value
  const price = document.getElementById("inputPrice").value
  const title = document.getElementById("inputTitle").value
  const teater = document.getElementById("inputTeater").value

  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtX2Zhcmhhbjox");
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    "hari": date,
    "jam": hour,
    "harga": price,
    "judul": title,
    "nama": teater

  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("http://127.0.0.1:5000/jadwal/", requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result)
      if (result.message == 'sukses') {
        alert("Success Create New Movie")
        location.reload()
      }
    })
    .catch(error => console.log('error', error));

}

function deletemovieschedule(id) {
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Basic YWRtX2Zhcmhhbjox");

  var requestOptions = {
    method: 'DELETE',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch("http://127.0.0.1:5000/jadwal/" + id, requestOptions)
    .then(response => response.json())
    .then(result => {
      console.log(result)
      if (result.message == 'sukses') {
        alert("Success Delete Movie Schedule")
        location.reload()
      }
    })
    .catch(error => console.log('error', error));
}

(function () {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    if (all) {
      select(el, all).forEach(e => e.addEventListener(type, listener))
    } else {
      select(el, all).addEventListener(type, listener)
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Sidebar toggle
   */
  if (select('.toggle-sidebar-btn')) {
    on('click', '.toggle-sidebar-btn', function (e) {
      select('body').classList.toggle('toggle-sidebar')
    })
  }

  /**
   * Search bar toggle
   */
  if (select('.search-bar-toggle')) {
    on('click', '.search-bar-toggle', function (e) {
      select('.search-bar').classList.toggle('search-bar-show')
    })
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Initiate tooltips
   */
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })

  /**
   * Initiate quill editors
   */
  if (select('.quill-editor-default')) {
    new Quill('.quill-editor-default', {
      theme: 'snow'
    });
  }

  if (select('.quill-editor-bubble')) {
    new Quill('.quill-editor-bubble', {
      theme: 'bubble'
    });
  }

  if (select('.quill-editor-full')) {
    new Quill(".quill-editor-full", {
      modules: {
        toolbar: [
          [{
            font: []
          }, {
            size: []
          }],
          ["bold", "italic", "underline", "strike"],
          [{
              color: []
            },
            {
              background: []
            }
          ],
          [{
              script: "super"
            },
            {
              script: "sub"
            }
          ],
          [{
              list: "ordered"
            },
            {
              list: "bullet"
            },
            {
              indent: "-1"
            },
            {
              indent: "+1"
            }
          ],
          ["direction", {
            align: []
          }],
          ["link", "image", "video"],
          ["clean"]
        ]
      },
      theme: "snow"
    });
  }

  /**
   * Initiate TinyMCE Editor
   */
  const useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isSmallScreen = window.matchMedia('(max-width: 1023.5px)').matches;

  tinymce.init({
    selector: 'textarea.tinymce-editor',
    plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons',
    editimage_cors_hosts: ['picsum.photos'],
    menubar: 'file edit view insert format tools table help',
    toolbar: 'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
    toolbar_sticky: true,
    toolbar_sticky_offset: isSmallScreen ? 102 : 108,
    autosave_ask_before_unload: true,
    autosave_interval: '30s',
    autosave_prefix: '{path}{query}-{id}-',
    autosave_restore_when_empty: false,
    autosave_retention: '2m',
    image_advtab: true,
    link_list: [{
        title: 'My page 1',
        value: 'https://www.tiny.cloud'
      },
      {
        title: 'My page 2',
        value: 'http://www.moxiecode.com'
      }
    ],
    image_list: [{
        title: 'My page 1',
        value: 'https://www.tiny.cloud'
      },
      {
        title: 'My page 2',
        value: 'http://www.moxiecode.com'
      }
    ],
    image_class_list: [{
        title: 'None',
        value: ''
      },
      {
        title: 'Some class',
        value: 'class-name'
      }
    ],
    importcss_append: true,
    file_picker_callback: (callback, value, meta) => {
      /* Provide file and text for the link dialog */
      if (meta.filetype === 'file') {
        callback('https://www.google.com/logos/google.jpg', {
          text: 'My text'
        });
      }

      /* Provide image and alt text for the image dialog */
      if (meta.filetype === 'image') {
        callback('https://www.google.com/logos/google.jpg', {
          alt: 'My alt text'
        });
      }

      /* Provide alternative source and posted for the media dialog */
      if (meta.filetype === 'media') {
        callback('movie.mp4', {
          source2: 'alt.ogg',
          poster: 'https://www.google.com/logos/google.jpg'
        });
      }
    },
    templates: [{
        title: 'New Table',
        description: 'creates a new table',
        content: '<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>'
      },
      {
        title: 'Starting my story',
        description: 'A cure for writers block',
        content: 'Once upon a time...'
      },
      {
        title: 'New list with dates',
        description: 'New List with dates',
        content: '<div class="mceTmpl"><span class="cdate">cdate</span><br><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>'
      }
    ],
    template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
    template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
    height: 600,
    image_caption: true,
    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
    noneditable_class: 'mceNonEditable',
    toolbar_mode: 'sliding',
    contextmenu: 'link image table',
    skin: useDarkMode ? 'oxide-dark' : 'oxide',
    content_css: useDarkMode ? 'dark' : 'default',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
  });

  /**
   * Initiate Bootstrap validation check
   */
  var needsValidation = document.querySelectorAll('.needs-validation')

  Array.prototype.slice.call(needsValidation)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })

  /**
   * Initiate Datatables
   */
  const datatables = select('.datatable', true)
  datatables.forEach(datatable => {
    new simpleDatatables.DataTable(datatable);
  })

  /**
   * Autoresize echart charts
   */
  const mainContainer = select('#main');
  if (mainContainer) {
    setTimeout(() => {
      new ResizeObserver(function () {
        select('.echart', true).forEach(getEchart => {
          echarts.getInstanceByDom(getEchart).resize();
        })
      }).observe(mainContainer);
    }, 200);
  }

})();