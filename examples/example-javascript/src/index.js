import png from './woman.png'

function greeter(person) {
  return 'Hello, ' + person.firstName + ' ' + person.lastName;
}

document.body.appendChild(png);

let user = { firstName: 'Jane', lastName: 'User' };

export let s = greeter(user);
