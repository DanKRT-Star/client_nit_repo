import axios from 'axios';

const data = await axios.get('https://jsonplaceholder.typicode.com/users/1');

console.log(data);