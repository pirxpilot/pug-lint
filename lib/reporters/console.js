module.exports = errors => {
  if (errors.length) {
    const messages = [];

    errors.forEach(error => {
      if (messages.length > 0) {
        messages.push('');
      }

      messages.push(error.message);
    });

    console.error(messages.join('\n'));
  }
};
