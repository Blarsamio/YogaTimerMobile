import Swal from "sweetalert2";

const signUp = (event) => {
  event.preventDefault();
  const emailValue = document.getElementById("email");
  const passwordValue = document.getElementById("password");
  // Todo : send the request with fetch
  const url = "https://reqres.in/api/register";
  const requestDetails = {
    method: "POST",
    headers: {"Content-Type": "application/json", "X-API-Key": "reqres-free-v1"},
    body: JSON.stringify({"email": emailValue, "password": passwordValue})
  };
  fetch(url, requestDetails)
    .then((response) => {
      if (response.status === 200) {
        Swal.fire({title: 'Success', text: 'You are connected', icon: 'success'})
      } else {
        Swal.fire({title: 'Error!', text: 'Oups! A duck has drowned in the pond', icon: 'error'})
      }
    })
}

const form = document.querySelector("#form");
form.addEventListener("submit", signUp);
