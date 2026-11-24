package iris

import "github.com/bonisoft3/pronto/identity"

// Google signs a person in by its own button, for iris's own client (Google
// Cloud project trash-362115, branded iris), whose origin is production's;
// staging signs in through the broker in its place (.say.cue). Bluesky by AT
// Protocol, whose client is the app's origin. A release turns them on.
identity.#Signin & {
	signin: {
		providers: ["google", "bluesky"]
		clients: google: {client: "646949889529-q3q2j0s38lsi8j4o8edl6jrn7abbrjff.apps.googleusercontent.com", credential: true}
	}
}
