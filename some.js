let num = +prompt('Please enter a positive number')
if (num < 0) {
	console.log(`You entered the wrong number`)
} else {
	let primes = []
	for (let i = 2; i <= num; i++) {
		if (isPrime(i)) {
			primes.push(i) // Add prime numbers to the array
		}
	}
	console.log(`These are the prime numbers until ${num}: ${primes.join(', ')}`)
}

// Function to check if a number is prime
function isPrime(n) {
	if (n < 2) return false // Numbers less than 2 are not prime
	for (let i = 2; i <= Math.sqrt(n); i++) {
		if (n % i === 0) {
			return false // If divisible, it's not prime
		}
	}
	return true
}
