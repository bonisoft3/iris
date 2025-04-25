# Iris

> We see through the waste


## How to use it

Iris is distributed as a PWA in https://iris.cleaning, or as a packaged app in
https://play.google.com/store/apps/details?id=com.trash.tracker.

## Contributing

Iris development is done primarily in github codespaces but the
development setup is regularly tested in Ubuntu, MacOs and Windows. 

In https://github.com/worldsense/trash, you can click on "code" to get
instructions on how to clone the code to your local machine or kickstart a
codespace with the code. Among those, the recommended choice is to install the
github cli [https://cli.github.com/] and grab a copy of the source code in your
local machine.

`gh repo clone worldsense/trash`

Iris is developed in a monorepo, and it introduces its own notions of
environments covering the full devops spectrum. This model borrows  some ideas
from firebase dev-workflows (https://firebase.google.com/docs/projects/dev-workflows/overview-environments)
but we extend it further to provide create a ai-first developing experience.

We define seven environments, each with a pair of actions. They are a) pkg, b) cli, c)
ide, d) container, e) k8s, f) cld, g) xpl. They are named after the kind of interface
the developer mostly interacts with at each environment. The container enviroment
is the one that provides most isolation, and where we start. If you are a
developer, you will likely move to b) and a) to write new code efficiently. If
you are an operator, you will likely move towards d) and e) to interact with
production.  

In the monorepo, all the local library dependencies for each service are built
as part of the build process, through the monorepo support of each individual
language. Cross language dependencies are only possible through services, and
service dependencies are brought up as containers.

Although not strictly necessary, we recommend the installation of just
[https://github.com/casey/just], which we use as a convenience command runner
and nushell [https://www.nushell.sh/], for portable shell scripting. You can install
those manually or running `./bootstrap`.

Now we will start with the container environment, and then visit the other
enviroments. 

# container

The only strictly required tools for this environment are docker and
docker-compose. The mechanisms of installing those varies vastly across
operating systems. We recommend that you use Docker for Desktop if you can
use it freely, or use Rancher Desktop with nerdctl otherwise. 

This is the most isolated environment, and everything happens within a
container. The advantage of an isolated environment is that it avoids
the "works in my machine" problem. For demonstrations purposes, we will use the
service under the service/tracker directory, so the first thing we do is to cd
there.

`cd services/tracker`

### develop

The develop action in the container environment can be run in any directory
of the monorepo that contains a compose.yaml configuration. For example:

The command below will start the application under services/tracker, possibly with
hot reload and/or debugging functionality. Any inter service dependencies
should be brought up automatically by the application itself, through
testcontainers, leveraging docker-compose.

`just develop`

### integrate

The second action available in the container environment is integrate, which will
run integration tests. Like the local deploy, integration tests rely heavily on
testcontainers for the fake implementations of 3rd party dependencies.

Integration tests can run in parallel, hence they cannot access shared
resources, including the internet. Unlike unit tests though, they can access
the local network, and while non-determinism should be avoided, it is allowed.
During integration, all heavy static analysis is be performed.

`just integrate`

# cli

This is an environment where you work mostly on the command line interface in
your local machine. Within this environment, there are two main actions one can
use. In this environment we leverage scoop.sh if you are developing in windows,
and pkgx.sh if you are on mac or linux distros that support it. 

### setup

The first action offered in the cli enviroment is setup.
It  will install all the development tools for your local development cycle in a
given service. We use just as a the convenience command runner, which delegates
to a portable nushell script and drives scoop and pkgx.sh to install locally
what you require. For example, it will install a jvm, or the golang toolchain,
depending on the directory you are, allowing you to develop locally the
project contained in the directory. 

`just setup`

Notice that this will install the development tools for the project globally. 

### vet

This action verifies that everything is fine in your environment. It relies
mostly on `cuelang` to make sure checked-in generated code is up-to-date. In
particular, we offer first class copy-and-paste support across yaml configuration
and other files, since native composition systems can be limited in many
stacks.

`just vet`

# ide

In this environment you are mostly working on the IDE, be it neovim, vscode or
intellij, among others. Since vscode has widespread support, we treat as the
first class editor, and integrate with it by providing configuration files
for each directory, and by leveraging the vscode-test-runner, aka `vtr` to
provide the most common actions in this environment, compiling and unit testing
code.

You can install visual studio code by following the official instructions. The
companion vtr tool is installed on demand when you run any action from this
environment.
 
### build

In this action we exercise not only the build tooling, but the application code
validity. Note we do not consider linting or any heavy static analysis part of
the compile stage, and ideally this action does not touch test code. Code
compiled in this stage should not be optimized. The command below will compile
all the code for a given directory.

`just build`

This ultimately deleages to the default build task defined in .vscode/tasks.json,
and also accessible through visual studio code UI.

### test

The test environment is where unit tests run. Code in this environment
should be completely deterministic, implying no unseeded prng, no shared
filesystem access, no network calls and so on. The code is run either
from within the IDE or through the build tooling for the language.
External dependencies are always mocked, and internal dependencies often are
as well. Since fully mocked unit tests are not terribly good
at catching bugs, we do not worry about achieving great coverage. Instead,
we focus on providing a convenient development loop and, for dynamic languages,
augmenting the compiler. The hallmark rule of this environment is that everything is
deterministic. The command below should run the tests for a given directory.

`just test`

This ultimately deleages to the default test task defined in .vscode/tasks.json,
and also accessible through visual studio code UI.

# Cluster

If you are using your ops hat, this is where you will spend time testing your
yamls. We will work with a k8s cluster, usually one locally created with kind,
and we will stitch the services together. For commands in this enviroment
you need running kubernetes cluster. We recommend using kind to create one.

`kind create cluster -n iris`

### preview

The preview environment is capable of building the full code and bringing
up any services. It is orchestrated by skaffold, which builds the code
with increased hermeticity, and brings up all services by default. Deployment
is fully isolated through the usage of a local kubernetes cluster. The preview
enviroment is brought up with the commands belows. You can run

`just preview`

which will ultimately launch `skaffold dev` from inside a container.

This will bring the full app, frontend, backends and supporting infrastructure
in the kind-iris kubectl context. This setup is better suited for debugging
integration problems spawning several components and for executing functional
tests. It can also power a pristine QA environment or serve as a simple way of
sharing private development results. Services within preview are shared.

Although this environment provides all first-party service dependencies, it
does not allow outbound communication with any external third-party service
dependency. Those need to be mocked, faked or deployed as an internal service
in the k8s cluster. The hallmark rule of this environment is the lack of
external network connectivity (but for convenience it does allow fetching
things that could be vendored like maven repositories or sha1-pinned images in
external docker repositories).

In Micronaut, this corresponds to the KUBERNETES environment, whereas in pnpm,
this corresponds to NODE_ENV=`production` and APP_ENV=`preview`. Breakpoints
can be achieved through tools like Google's Cloud Code plugin for Intellij and
VSCode or CNCF's Telepresence

Code in the preview environment should be fully optimized.

### verify

Runs a series of e2e tests agains the preview environment, including screenshot
and load tests.

`just verify`

# Cloud

For this environment you work through the cloud tools, aws cli, gcloud or az.

### stage

The staging environment is a shared, long lived deployment targeted by ci/cd.
Code is built hermetically by the ci/cd pipeline and pushed to GCP by skaffold.
It is as close to production as possible, but it does not contain any private
data, and hence has less security restrictions than production. Code follows
the master branch and is pushed on every commit.

`just stage`

which translates to `skaffold run -p staging`

### publish

Code is manually approved from staging to production and runs with
a modified configuration. Currently code can be manually pushed to production
with `just production`, which will translate to `skaffold run -p production`.

In Micronaut, this corresponds to the gcp environment, whereas in pnpm,
this corresponds to NODE_ENV=`production` and APP_ENV=`production`.

# Frontend development

Iris uses the nuxt3 framework for the frontend, together with pnpm. The main
pwa application lives in //guis/web, and can be developed by simply running
`pnpm dev`. The codebase is idiomatic, and with general nuxt3 knowledge
one should have no problem navigating it.

In this setup, the frontend points to production backends, which may forbid
access due to CORS restrictions. You may use the [Allow CORS: Access-Control-Allow-Origin](https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=en) chrome extension to bypass it.

# Backend development

The backend development is done using the micronaut framework and kotlin. The
main service lives in //services/tracker and can be run with ./gradlew run.

# Infrastructure development

We refer as infrastructure to any services which are not tied to Iris mission
and serve solely as general software building blocks. We support the following
types of infrastructure, in the order of preference:
a) typical IaC using GCP config controller
b) other 3rd party SaaS solutions
c) open source servers, assembled and configured with `docker compose build`
d) tailor-made but agnostic infrastructure, written in rust and built with
cargo
