const readline = require('readline');
const fs = require('fs');

function get_input_words() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question("Enter the number of words you want to input: ", num_words => {
      const words = [];
      const ask_word = i => {
        if (i < num_words) {
          rl.question("Enter a word: ", word => {
            words.push(word);
            ask_word(i + 1);
          });
        } else {
          rl.close();
          resolve(words);
        }
      };
      ask_word(0);
    });
  });
}

function get_letter_substitutions() {
  return {
    'a': ['4', '@', 'ä'],
    'b': ['8'],
    'e': ['3', '€'],
    'g': ['6', '9'],
    'h': ['#'],
    'i': ['1', '!'],
    'l': ['1', '|'],
    'o': ['0', 'ö'],
    's': ['5', '$'],
    't': ['7'],
    'z': ['2'],
    'u': ['ü']
  };
}

function get_special_symbols() {
  return ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+',    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'ä', 'ö', 'ü'];
}

function generate_case_combinations(word) {
  if (word.length === 0) {
    return [''];
  }
  const first_letter = word.charAt(0);
  const rest_combinations = generate_case_combinations(word.substring(1));
  const substitutions = get_letter_substitutions()[first_letter.toLowerCase()] || [];
  const combinations = [];
  for (const rest of rest_combinations) {
    combinations.push(first_letter.toLowerCase() + rest);
    combinations.push(first_letter.toUpperCase() + rest);
    for (const sub of substitutions) {
      combinations.push(sub + rest);
    }
  }
  return combinations;
}

function count_combinations(words) {
  let count = 0;
  for (let i = 0; i <= words.length; i++) {
    for (const combo of combinations(words, i)) {
      const mixed_case_combos = product(...combo.map(word => generate_case_combinations(word)));
      count += mixed_case_combos.length * combinations(range(combo.length + 1), 16 - combo.join('').length).length;
    }
  }
  return count;
}

function* combinations(array, length) {
  if (length === 0) {
    yield [];
  } else if (array.length === length) {
    yield array;
  } else if (array.length > length) {
    const [first, ...rest] = array;
    for (const combo of combinations(rest, length - 1)) {
      yield [first, ...combo];
    }
    for (const combo of combinations(rest, length)) {
      yield combo;
    }
  }
}

function* product(...args) {
  if (args.length === 0) {
    yield [];
  } else {
    const [head, ...tail] = args;
    for (const item of head) {
      for (const rest of product(...tail)) {
        yield [item, ...rest];
      }
    }
  }
}

async function generate_and_save_combinations(words, file_name = "combinations.txt") {
  const special_symbols = get_special_symbols();
  let completed_combinations = 0;
  const generated_combinations = new Set();
  const stream = fs.createWriteStream(file_name);
for (let i = 0; i <= words.length; i++) {
for (const combo of combinations(words, i)) {
const mixed_case_combos = product(...combo.map(word => generate_case_combinations(word)));
for (const mixed_case_combo of mixed_case_combos) {
for (let filler_count = 0; filler_count <= 16 - mixed_case_combo.join('').length; filler_count++) {
for (const filler_positions of combinations(range(combo.length + 1), filler_count)) {
for (const filler_set of product(...Array.from({ length: filler_count }, () => special_symbols))) {
const result = [];
let filler_index = 0;
for (let j = 0; j < mixed_case_combo.length; j++) {
if (filler_positions.includes(j)) {
result.push(filler_set[filler_index]);
filler_index++;
}
result.push(mixed_case_combo[j]);
}
const combination = result.join('');
if (combination.length <= 32 && !generated_combinations.has(combination)) {
stream.write(combination + '\n');
generated_combinations.add(combination);
completed_combinations++;
if (completed_combinations % 1000 === 0) {
process.stdout.write("\r${completed_combinations} combinations completed.");
}
}
}
}
}
}
}
}
stream.close();
console.log("\n${generated_combinations.size} unique combinations saved to '${file_name}'");
}

async function main() {
const words = await get_input_words();
await generate_and_save_combinations(words);
console.log("\nCombinations saved to 'combinations.txt'");
}

if (require.main === module) {
main();
}