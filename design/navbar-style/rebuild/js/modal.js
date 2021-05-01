const privacy_policy = document.querySelector('.privacy-policy');

privacy_policy.addEventListener('click', () => {
  const modal = document.querySelector('.modal');
  console.log('clicked privacy policy');
  modal.style.display = 'flex';

  // TODO: Add logic to close when click
  //       close button or outside modal.
});