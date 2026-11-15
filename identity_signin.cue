package iris

import "github.com/bonisoft3/pronto/identity"

identity.#Signin & {
	signin: {
		releaseBroker: "https://id.bonisoft3.com"
		providers:     ["google"]
	}
}
