## Run in docker
Make sure your host has [docker service](https://docs.docker.com/get-docker) installed.

1. Make sure you've built the [rasa3-for-botfront](https://github.com/djypanda/rasa3-for-botfront) docker image already.
2. Build the botfront docker image.
```bash
git clone https://github.com/djypanda/botfront-for-rasa3.git
cd botfront-for-rasa3
docker build . -t bf-for-rasa3:v0.1
```
If your building process exit on OOM error, just increase the docker service resource memory(e.g. 8G), and try again.
```
This container can use 5944M memory in total.
#16 0.350     If it aborts with an out-of-memory (OOM) or ‘non-zero exit code 137’ error message,
```

3. Create the project root directory.

If you haven't setup the dev environment, you should install `botfront` module: `npm install -g botfront`

Create the project somewhere not in the source code tree.
```bash
botfront init
```
4. Modity configuration in the project directory.
- edit `.botfront/docker-compose-template.yml`
<table text-align='left'>
  <tr>
    <th><h3>Original</h3></th>
    <th><h3>Change to</h3></th>
  </tr>
  <tr>
    <td width="50%">version: "3.0"</td>
    <td width="50%">version: "3.9"</td>
  </tr>
  <tr>
    <td width="50%">
    botfront: <br>
    &nbsp;&nbsp;image: botfront/botfront
    </td>
    <td width="50%">
    botfront: <br>
    &nbsp;&nbsp;image: bf-for-rasa3:v0.1
    </td>
  </tr>
  <tr>
    <td width="50%">
    rasa: <br>
    &nbsp;&nbsp;build:<br>
    &nbsp;&nbsp;&nbsp;&nbsp;context: ./rasa<br>
    &nbsp;&nbsp;args:<br>
    &nbsp;&nbsp;&nbsp;&nbsp;RASA_IMAGE: ${IMAGES_CURRENT_RASA}<br>
    &nbsp;&nbsp;...<br>
    &nbsp;&nbsp;volumes:<br>
    &nbsp;&nbsp;&nbsp;&nbsp;- ./models/:/app/models
    </td>
    <td width="50%">
    rasa: <br>
    &nbsp;&nbsp;image: rasa3-for-bf:v0.1<br><br><br><br>
    &nbsp;&nbsp;...<br>
    &nbsp;&nbsp;volumes:<br>
    &nbsp;&nbsp;&nbsp;&nbsp;- ./models/:/app/models<br>
    &nbsp;&nbsp;&nbsp;&nbsp;- ./config/:/app/config
    </td>
  </tr>
</table>

- edit `.botfront/botfront.yml`
```
images:
  default:
    botfront: 'bf-for-rasa3:v0.1'
    rasa: 'rasa3-for-bf:v0.1'
    duckling: 'botfront/duckling:latest'
    mongo: 'mongo:6.0.1'
    actions: 'rasa/rasa-sdk:3.2.1'
  current:
    botfront: 'bf-for-rasa3:v0.1'
    rasa: 'rasa3-for-bf:v0.1'
    duckling: 'botfront/duckling:latest'
    mongo: 'mongo:6.0.1'
    actions: 'rasa/rasa-sdk:3.2.1'
```

5. Start services.
```bash
botfront up
```
NOTE - After the first run you can use `docker-compose up [-d]` to start those services either.

6. Setup chitchat project
- Create a chat project, follow the link below:
  - https://botfront.io/docs/installation/local-machine

- rasa need a trained nlu module to startup (They don't have one in the init project root/models folder)

  - !!! Copy a dummy one from `demo_project/models`

- This step is critical, `botfront set-projects chitchat-5v7YtAmFF` (Change to your project name).
  - https://botfront.io/docs/installation/local-machine#connect-rasa-to-your-new-project

7. Open http://localhost:8888/ in browser.

First time it will take a quite long time to download meteor.js

8. Setup the zh language

In 'nlu' menu -> 'Settings' tab:

Update the pipeline with below text:
```
pipeline:
  - name: SpacyNLP
    model: zh_core_web_md
  - name: SpacyTokenizer
  - name: SpacyEntityExtractor
  - name: SpacyFeaturizer
  - name: RegexFeaturizer
  - name: LexicalSyntacticFeaturizer
  - name: CountVectorsFeaturizer
  - name: CountVectorsFeaturizer
    analyzer: char_wb
    min_ngram: 1
    max_ngram: 4
  - name: DIETClassifier
    constrain_similarities: true
    epochs: 100
  - name: EntitySynonymMapper
  - name: ResponseSelector
    epochs: 100
```
9. Train exampes, after train finished, click the chat icon(at right bottom), talk to your chatbot!

10. That's all, have fun!

## Development Installation

1. Botfront is a Meteor app, so the first step is to [install Meteor](https://www.meteor.com/install)
2. Then clone this repo and install the dependencies:
```bash
git clone https://github.com/djypanda/botfront-for-rasa3.git
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

2. Start your project with `botfront up -e botfront -e rasa`. This will run all services except the Botfront app and rasa since you are going to run it with Meteor and rasa 3 locally and mannually.

3. Make sure you started rasa3 service ([rasa3-for-botfront](https://github.com/djypanda/rasa3-for-botfront), the modified version).

4. Go back to the botfront checkout `cd botfront-for-rasa3/botfront` and run Botfront with `meteor npm run start:docker-compose.dev`. Botfront will be available at [http://localhost:3000](http://localhost:3000) so open your browser and happy editing :smile_cat:

<br/>
<h2 align="center">What's new ???</h2>

The ultimate target of this copy is to decouple the botfront and rasa, let botfront only do the editing work, and keep rasa as untoucned as possible!

## [DID:]

1. Removed multi-language support in one rasa instance. This this also suggested officially to be achieved multi-instances.
2. Add chinese as default language.
3. Temporary removed Gazette feature and some other features that need rasa to change the code inside nlu module.
4. Commented Story Behaviour

## [TODO:]

1. Action can be edited in botfront
2. Change the train payload from json (deprecated!) to yaml format
3. Make the botfront cli work for this repo
4. TBA.


<h2 align="center">
    <a href='https://github.com/botfront/botfront'> Original instruction goes here !!! </a>
</h2>

