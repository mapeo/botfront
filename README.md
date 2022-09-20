### Installation

1. Botfront is a Meteor app, so the first step is to [install Meteor](https://www.meteor.com/install)
2. Then clone this repo and install the dependencies:
```bash
git clone https://github.com/djypanda/botfront-for-rasa3
cd botfront-for-rasa3/botfront
meteor npm install
```
3. Install the CLI from the source code:
```bash
# if you installed Botfront from npm uninstall it.
npm uninstall -g botfront
# Install the cli from the source code
cd cli && npm link
```
Botfront needs to be connected to other services, especially Rasa. 

1. Create a Botfront project with `botfront init` (somewhere else, not in the repo)
Make sure your host has [docker service](https://docs.docker.com/get-docker) installed.
'botfront init' command will create a instance project directory and download pre-build docker images in which comes with rasa2.

2. Start your project with `botfront up -e botfront -e rasa`. This will run all services except the Botfront app and rasa since you are going to run it with Meteor locally, and start rasa3 mannually.

3. Make sure you started rasa3 service ([rasa3-for-botfront](https://github.com/djypanda/rasa3-for-botfront), the modified version).

4. Go back to the botfront checkout `cd botfront-for-rasa3/botfront` and run Botfront with `meteor npm run start:docker-compose.dev`. Botfront will be available at [http://localhost:3000](http://localhost:3000) so open your browser and happy editing :smile_cat:

<br/>
<h2 align="center">What's new ???</h2>

The ultimate target of this copy is to decouple the botfront and rasa, let botfront only do the editing work, and keep rasa as untoucned as possible!

### [DID:]

1. Removed multi-language support in one rasa instance. This this also suggested officially to be achieved multi-instances.
2. Add chinese as default language.
3. Temporary removed Gazette feature and some other features that need rasa to change the code inside nlu module.
4. Commented Story Behaviour

### [TODO:]

1. Action can be edited in botfront
2. TBA.

<h2 align="center">
    <a href='https://github.com/botfront/botfront'> Original instruction goes here !!! </a>
</h2>

