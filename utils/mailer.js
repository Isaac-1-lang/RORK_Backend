exports.sendMail = async ({ to, subject, text }) => {
  console.log('--- Mock Email ---');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Text:', text);
  console.log('------------------');
}; 