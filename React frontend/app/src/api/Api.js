import Cookies from 'universal-cookie';

const cookies = new Cookies();

const api = {

  getAuth: () => fetch('/api/auth', {

    method: 'POST', 
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cookies),
    credentials: 'include'

  })
  .then(res => res.json())
  .then(data => {

    if(data.cookie === 'Success') {
      return {
        token: true, 
        role: data.role,
        username: data.username
      };
    }
    else if(data.error) {
      return {error: data.cookie};
    }
    else {
      return {token: false};
    }

  }),

  confirmToken: (token) => fetch(`/api/confirmToken/${token}`, {

    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })
  .then(res => res.json())
  .then(data => {
    console.log(data)

    if(data.length > 0) {
      return {token: data[0].token, id: data[0].id};
    }
    else {
      return {message: 'Link has expired'};
    }

  })

}

export default api;