function greeter(person) {
  return 'Hello, ' + person.firstName + ' ' + person.lastName;
}

const user = greeter({ firstName: 'Jane', lastName: 'User' });

export default user;
