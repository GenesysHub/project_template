export const greet = {
  name: 'greet',
  description: 'Greet a user by name',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'The name of the user' },
    },
    required: ['name'],
  },
  call: ({ name }: { name: string }) => {
    if (typeof name !== 'string') {
      throw new Error('Name must be a string.');
    }
    return { result: `Hello, ${name}!` };
  },
};
