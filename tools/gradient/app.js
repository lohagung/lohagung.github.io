let colorOne = document.getElementById('color-a');
let colorTwo = document.getElementById('color-b');
let currentDirection = 'to bottom';
let outputCode = document.getElementById('code');

let setDirection = (value, _this) => {
  let directions = document.querySelectorAll('.buttons button');
  for (let i of directions) {
    i.classList.remove('active');
  }
  _this.classList.add('active');
  currentDirection = value;
  console.log(currentDirection);
};

let generateCode = () => {
  outputCode.value = `background-color:linear-gradient(${currentDirection},
    ${colorOne.value},${colorTwo.value});`;

  document.getElementsByTagName(
    'BODY'
  )[0].style.backgroundImage = `linear-gradient(${currentDirection},
    ${colorOne.value},${colorTwo.value})`;
};

let copyText = () => {
  outputCode.select();
  document.execCommand('copy');
  alert('Gradient Copied!');
};
