import { DEFAULT_VALUE } from '@/config';

interface Person {
  firstName: string;
  lastName: string;
}

function greeter(person: Person) {
  return 'Hello, ' + person.firstName + ' ' + person.lastName + DEFAULT_VALUE;
}

const user = greeter({ firstName: 'Jane', lastName: 'User' });

export default user;
