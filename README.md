
# 1. Project structure

### 1.1 Brief description
The project folder structure is separated by approaches

The `src/approach-1` folder contains the scripts that use `@google-cloud/storage` to transfer files.

The `src/approach-2` folder contains the script that uses `gsutil` to transfer files between buckets.

### 1.2 Description of the implementation of approach # 1

The implementation of this approach was created to be extended to cloud storage providers.

Also possible to define the number of files that can be transferred concurrently.

The implementation Google Storage handles some errors that may occur during the transfer. For this reason, the retry function was implemented. The retry can happen for a maximum of 5 times and if this value is reached, the transfer of the specific file is canceled and a warning is given in the log that an error occurred when trying to transfer the file, but the process of the other files continues.


### 1.3 Description of the implementation of approach # 2

The implementation this approach was created in a different way than approach # 1.

In this approach, i use bucket transfers instead of `file-by-file transfers` as in the other approach.

Using `gsutil` to transfer files by file is not feasible because it can consume a lot of CPU and memory on the machine because a new process is opened in the operational system for each file.

So the correct way to use `gsutil` is to pass the source and destination buckets since `gsutil` allows this option.


# 2. Setting up the environment for testing (local execution)

### 2.1 Installing the Google Cloud CLI
https://cloud.google.com/sdk/docs/install-sdk#installing_the_latest_version

### 2.2 Setting up the Application Default Credentials
https://cloud.google.com/docs/authentication/provide-credentials-adc#google-idp


# 3. Preparing data for the testing environment

### 3.1 Creating a directory called "upload"
```
mkdir upload
```

### 3.2 Downloading the data mass
```
curl -L https://github.com/liferay/liferay-portal/archive/refs/tags/7.4.3.124-ga124.tar.gz | tar xz -C uploads
```
```
curl -L https://github.com/chromium/chromium/archive/refs/tags/129.0.6625.2.tar.gz | tar xz -C uploads
```
```
curl -L https://github.com/torvalds/linux/archive/refs/tags/v6.11-rc1.tar.gz | tar xz -C uploads
```

_* In these cases I use the source code of projects available for download on github.com_

### 3.3 Create the test buckets
```
gcloud storage buckets create gs://rguedes-source --location us-east1
```
```
gcloud storage buckets create gs://rguedes-destination --location us-east1
```

### 3.4 Copy the data mass to the bucket rguedes-source

```
gsutil -m cp -r uploads/** gs://rguedes-source
```

# 4. Running the Challenge Approaches

### 4.1 Running Approach # 1 _(Using the @google-cloud/storage to copy files from one bucket to another)_

In the root project, run:

```
node src/approach-1/main.js gs://rguedes-source gs://rguedes-destination
```

### 4.2 Running Approach # 2 _(Using gsutil to copy files from one bucket to another)_

In the root project, run:

```
node src/approach-2/main.js gs://rguedes-source gs://rguedes-destination
```
