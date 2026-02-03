module.exports = errors => {
  if (errors.length) {
    errors.forEach(error => {
      const message = [error.filename, `:${error.line}`, error.column ? `:${error.column}` : '', ` ${error.msg}`];

      console.error(message.join(''));
    });
  }
};
