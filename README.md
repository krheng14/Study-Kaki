# Study Kaki

# 1.0 Problem Statement

In this digital age where learning has transformed from textbook-centric education to an integrated approach where educational videos play an increasingly vital role. These videos contain rich sources of information that can be taught to learners in a way that traditional methods can't.

However, it is often non-trivial to consolidate this vast amount of information. Remembering specific points from a video to find a particular concept we've come across somewhere in the video can be quite daunting.

# 2.0 How it Works

![Alt Text](/images/studyKakiExample.gif)

Study Kaki is a platform that allows learners to ask specific content-related questions about an educational video by leveraging on LLMs to provide context-aware answers.

Study Kaki also allows learners to generate potential study questions based on the content of the video, to reinforce their understanding of the material.

# 3.0 Features

## 3.1 Video Question & Answering

Users can ask questions about the video content by indicating the YouTube URL. The transcript for the video will then be generated and users can start asking questions about the video content in the chat area.

The platform will then provide a response to the user's query as well as the source of the answer that the platform has retrieved the information from. Additionally, the corresponding timestamp will be made available to the user to click on to jump straight to the part of the video to be played for users to review the video content.

## 3.2 Explain Like I'm Five

If users are unsatisfied with the platform's response, or if the response is too complex and the user would like the response to be simplified, they can click on the "Explain like I'm 5" button to regenerate an answer that is more easily digested, with analogies to facilitate user's understanding of the concept.

## 3.3 Request Test Questions

To further consolidate user's learning, users can generate questions based on the specific video content, and attempt to answer them.

# 4.0 How to Use

## 4.1 Setting up PostgresSQL database

This project uses PostgresSQL, an open source object-relational database system.

You can download the it from here:
https://www.postgresql.org/download/

Upon setting up PostgresSQL, create a database for our project by entering the following:

```
CREATE DATABASE docquery
```

## 4.2 Setting up python-django backend

This is the folder structure for the backend.

```
│   ...
├── api
│   ├── __init__.py
│   ├── __pycache__
│   ├── asgi.py
│   ├── local_settings.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── docqueryapi
│   ├── __init__.py
│   ├── __pycache__
│   ├── admin.py
│   ├── apps.py
│   ├── migrations
│   ├── models.py
│   ├── serializers.py
│   ├── tests.py
│   ├── urls.py
│   └── views.py
├── manage.py
│   ...
```

### <u>4.2.1 Installing and activating virtual environment</u>

We used virtualenv to create our python environment. You can install the virtualenv package using `pip` by running the following:

```
pip install virtualenv
```

Next, set up the virtual environment and activate it using an environment name of your choice:

```
cd study-kaki
virtualenv <my_env_name>
source <my_env_name>/bin/activate
```

### <u>4.2.2 Installing python packages</u>

Install the required python packages by running the following:

```
pip install -r requirements.txt
```

### <u>4.2.3 Migrating data models</u>

Under the `docqueryapi/models.py` and `docqueryapi/serializers.py` files, we have indicated the metadata and essential fields and behavior of the data we are storing. To reflect these changes onto the PostgresSQL database, we'll have to run the following:

```
python manage.py makemigrations
python manage.py migrate
```

### <u>4.2.4 Running the backend</u>

Run the backend python-django server by running the following:

```
python manage.py runserver
```

The server will run on `localhost:8000`.

## 4.3 Setting up React frontend

### <u>4.3.1 Installing Yarn package manager</u>

This project uses the yarn package manager. You can install Yarn from here:
https://classic.yarnpkg.com/en/docs/install#mac-stable

### <u>4.3.2 Installing node modules</u>

The frontend is built using the React framework. The modules used can be installed by running the following in the root directory:

```
yarn install
```

### <u>4.3.3 Running the frontend</u>

Run the frontend by running the following:

```
yarn start
```

The client will run on `localhost:3000`. Navigate to `localhost:3000/videoquery` to interact with the Study Kaki webapp.

# 5.0 Future Work

- [ ] Chat / forum for learners and teachers to interact with each other
- [ ] Quiz generator (MCQs)
- [ ] Importing of documents in various format (e.g. .pdf & .txt)
