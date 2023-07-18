//See: https://codingbeautydev.com/blog/javascript-swap-array-elements/
// Also see (for better understanding): https://www.freecodecamp.org/news/swap-two-array-elements-in-javascript/#:~:text=You%20just%20create%20a%20new,elements%20in%20the%20reversed%20order.&text=%2C68%2C80%5D-,You%20can%20also%20create%20a%20reusable%20function%20to%20handle%20this,indexes%20you%20wish%20to%20swap.
export const swapElements = (
  array: Array<unknown>,
  index1: number,
  index2: number
) => {
  array[index1] = array.splice(index2, 1, array[index1])[0];
};

//See: https://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
export const moveElement = (
  arr: Array<unknown>,
  currentIndex: number,
  newIndex: number
) => {
  if (newIndex >= arr.length) {
    let k = newIndex - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(newIndex, 0, arr.splice(currentIndex, 1)[0]);
};
