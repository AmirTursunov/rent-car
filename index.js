// function fn(string) {
//   console.log(string.split("").reverse().join(""));
// }
// fn("amir");

// function max(arr) {
//   console.log(Math.max(...arr));
// }
// max([4, 6, 10]);

// FizzBuzz
// for (let i = 1; i <= 100; i++) {
//   if (i % 3 === 0 && i % 5 === 0) {
//     console.log("FizzBuzz");
//   } else if (i % 3 === 0) {
//     console.log("Fizz");
//   } else if (i % 5 === 0) {
//     console.log("Buzz");
//   } else {
//     console.log(i);
//   }
// }

// Duplicate
// function findDuplicates(arr) {
//   let a = new Set();
//   let dup = new Set();
//   for (let num of arr) {
//     if (a.has(num)) {
//       dup.add(num);
//     } else {
//       a.add(num);
//     }
//   }
//   console.log([...a]);
// }
// findDuplicates([1, 2, 3, 4, 5, 1, 2, 3, 1, 4, 11, 12, 11]);

// function findMaxAndMin(arr) {
//   console.log(Math.max(...arr), Math.min(...arr));
// }
// findMaxAndMin([2, 5, 1]);

// function isAnagram(str1, str2) {
//   str1 = str1.replace(/\s/g, "").toLowerCase();
//   str2 = str2.replace(/\s/g, "").toLowerCase();
//   if (str1.length !== str2.length) {
//     return false;
//   }
//   console.log(str1.split("").sort().join() === str2.split("").sort().join());
// }
// isAnagram("listen", "silent");
// isAnagram("hello", "world");

// function isPalindrome(n) {
//   if (n < 0) return false;
//   const s = String(n);
//   const rev = s.split("").reverse().join("");
//   return s === rev;
// }
// console.log(isPalindrome(121));
// console.log(isPalindrome(151));
// console.log(isPalindrome("nice"));

// function unique(str) {
//   for (let i = 0; i < str.length; i++) {
//     if (str.indexOf(str[i]) === str.lastIndexOf(str[i])) {
//       return str[i];
//     }
//   }
//   return null;
// }
// console.log(unique("swiss"));
// console.log(unique("repeater"));
// console.log(unique("aabbcc"));

// function isAnagram(str1, str2) {
//   str1 = str1.replace(/\s/g, "").toLowerCase();
//   str2 = str2.replace(/\s/g, "").toLowerCase();
//   if (str1.length !== str2.length) {
//     return false;
//   }
//   return str1.split("").sort().join() === str2.split("").sort().join();
// }
// console.log(isAnagram("listen", "silent"));

// const arr = [1, [2, 3, 4, 5], [6, 7], 8, [9, 10]];
// const newArr = [...arr];
// const flatArr = arr.flat(Infinity);
// console.log(flatArr);
// console.log(newArr);

// function outer() {
//   let count = 0;
//   return function inner() {
//     count++;
//     return count;
//   };
// }

// const counter = outer();
// console.log(counter());
// console.log(counter());

// function sortedArr(arr) {
//   const sortedObj = {
//     strings: [],
//     numbers: [],
//     other: [],
//   };
//   arr.forEach((item) => {
//     if (typeof item === "string") {
//       sortedObj.strings.push(item);
//     } else if (typeof item === "number") {
//       sortedObj.numbers.push(item);
//     } else {
//       sortedObj.other.push(item);
//     }
//   });
//   return sortedObj;
// }
// console.log(sortedArr(["Amir", "Kimdir", 2, 3, true]));

// function fibonacciSum(limit) {
//   let a = 0;
//   let b = 1;
//   let sum = 0;
//   for (; a <= limit; ) {
//     sum += a;
//     let next = a + b;
//     a = b;
//     b = next;
//   }
//   return sum;
// }
// console.log(fibonacciSum(10));

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // Juda sekin ishlaydi
// function findPalindromes(n) {
//   if (n < 0) return false;
//   const s = String(n);
//   let rev = s.split("").reverse().join("");
//   return rev === s;
// }
// console.log(findPalindromes("kiyik"));
// console.log(findPalindromes(123));
// console.log(findPalindromes(121));

// const controller = new AbortController();
// const signal = controller.signal;
// fetch("https://jsonplaceholder.typicode.com/posts", { signal })
//   .then((res) => res.json())
//   .then((data) => console.log(data))
//   .catch((err) => {
//     if ((err.name = "AbortError")) {
//       console.log("Sorov bekor qilindi");
//     } else {
//       console.log(err);
//     }
//   });
// setTimeout(() => {
//   controller.abort;
// }, 2000);

// const arr = [1, 2, [3, [4]], 5];
// const flatArr = arr.flat(Infinity);
// console.log(flatArr);

// function countChars(str) {
//   const count = {};
//   for (const i of str) {
//     count[i] = (count[i] || 0) + 1;
//   }
//   return count;
// }
// console.log(countChars("amirrrr"));
// const person = {
//   greet() {
//     console.log("Salom!");
//   },
// };

// const student = Object.create(person); // student -> person prototypega ega
// student.name = "Ali";

// student.greet(); // "Salom!"
