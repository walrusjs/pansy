import { DEFAULT_VALUE } from '@/config';

interface Person {
  firstName: string;
  lastName: string;
}

function greeter(person: Person) {
  console.log(DEFAULT_VALUE);
  return 'Hello, ' + person.firstName + ' ' + person.lastName;
}

let user = { firstName: 'Jane', lastName: 'User' };

export let s = greeter(user);
