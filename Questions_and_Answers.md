# Questions

### Question 8
> You may run into errors that occur when trying to copy too many files at once. What error occurs and what info can you find on the web about it? How many files can safely be copied at a time without running into errors? In your repo, add a simple text file where you give your answers to these and future questions.

When I tried to send all the files at once the error that occurred was:

__read ECONNRESET__

```
Error transferring files: FetchError: request to https://storage.googleapis.com/storage/v1/b/rguedes-src/o/Documentation%2Finfiniband%2Findex.rst/rewriteTo/b/rguedes-dest/o/Documentation%2Finfiniband%2Findex.rst? failed, reason: read ECONNRESET
    at ClientRequest.<anonymous> (/home/rodrigo/development/transfer-buckets/node_modules/node-fetch/lib/index.js:1501:11)
    at ClientRequest.emit (node:events:519:28)
    at TLSSocket.socketErrorListener (node:_http_client:500:9)
    at TLSSocket.emit (node:events:519:28)
    at emitErrorNT (node:internal/streams/destroy:169:8)
    at emitErrorCloseNT (node:internal/streams/destroy:128:3)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
  type: 'system',
  errno: 'ECONNRESET',
  code: 'ECONNRESET'
}
```

However the error may depend on several factors, such as the bucket region, the storage type, and the network.

In the Google Storage documentation, there are practices that they recommend the following:
https://cloud.google.com/storage/docs/best-practices

Regarding the error code, some strategies are recommended
https://cloud.google.com/storage/docs/retry-strategy


In implementing `approach # 1` I followed the recommendation of not sending more than 1000 write requests per second so I implemented a way to limit the number of simultaneous requests to 500 at a time and also implemented the retry strategy with Exponential Backoff.

I did a test with 1000 requests following the documentation https://cloud.google.com/storage/docs/request-rate but I received the following error:

```
/home/rodrigo/development/transfer-buckets/node_modules/node-fetch/lib/index.js:1501
                        reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
                               ^
FetchError: request to https://storage.googleapis.com/storage/v1/b/rguedes-src/o/chromium-129.0.6625.2%2Fthird_party%2Fblink%2Fweb_tests%2Fediting%2FexecCommand%2Findent-images-2.html/rewriteTo/b/rguedes-dest-1/o/chromium-129.0.6625.2%2Fthird_party%2Fblink%2Fweb_tests%2Fediting%2FexecCommand%2Findent-images-2.html? failed, reason: socket hang up
    at ClientRequest.<anonymous> (/home/rodrigo/development/transfer-buckets/node_modules/node-fetch/lib/index.js:1501:11)
    at ClientRequest.emit (node:events:519:28)
    at TLSSocket.socketOnEnd (node:_http_client:524:9)
    at TLSSocket.emit (node:events:531:35)
    at endReadableNT (node:internal/streams/readable:1696:12)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
  type: 'system',
  errno: 'ECONNRESET',
  code: 'ECONNRESET'
}
```

So the solution was to reduce it to 500 requests, which also made the server's resource usage acceptable.


# Comparison between approaches

The result of using `@google-cloud/storage` vs `gsutil` may vary depending on the scenarios.

During the development of this challenge, I had two scenarios as a basis:

* Copying files between buckets with relatively small sizes but a large number of files (> 500k).

* Copying files between buckets with large sizes (> 1.5Gb) but a small number of files.


### Regarding a scenario where there are few large files:

Both approaches were satisfactory.

Both had similar resource consumption (CPU and Memory) and performance below 40% and less than 5 minutes to transfer more than 8 Gb.

### Regarding a scenario where there are thousands of files with small sizes:

__Summary__: `Approach # 1` stood out, as it managed to consume acceptably and finished much faster.

#### Scenario Description:

Data mass 8.1Gb of data with 630,487 files.

The tests for this scenario were run in a controlled environment using a VM e2-custom with 2 cores and 1024Mb of memory on Google Cloud Compute Engine in the same region as the us-east1 bucket. For more details, see 1_README.md (Item 3. Preparing data for the testing environment)

| Approach   | Time to finish | Average CPU Usage | Average Memory Usage |
| ----------- | ------------------------------------------ | ------------------- | ----------------------- |
| Approach # 1 | 26 min | 70% | 870Mb |
| Approach # 2 | 68 min | 60% in the first 10 minutes then it reduced to 20% | 760Mb |

My conclusion is that using `@google-cloud/storage` is better in cases where there is a large number of files to be transferred from one bucket to another because the difference in CPU and memory resource usage is not that different between the two but the transfer time is much shorter when using approach #1 `@google-cloud/storage`.

Regarding the pros and cons between the approaches without observing the time value for completing file copying, I conclude as follows.

#### Approach #1 `@google-cloud/storage`

__Pros:__
Allows greater flexibility in the code, allowing customization of file copy operations based on the resources of the server to be executed (amount of CPU and memory). Example: If the server is shared with other tasks, the code can customize the number of files to transfer simultaneously based on the CPU and memory usage available at the time.

__Cons:__
Since the Google Cloud Storage API is subject to change, code maintenance must occur more frequently, and an unhandled error that has recently arisen from a new version of the Google Cloud Storage API may occur.


#### Approach #2 `gsutil`
__Pros:__
Easier to use, without having to worry about using server resources (CPU and Memory)

__Cons:__
Lower performance compared to `@google-cloud/storage` when transfering large amounts of small files is necessary.
Although it has some settings to customize the number of threads parallel_thread_count/parallel_process_count is still less flexible for complex use cases that require custom application logic.


# Recommendation

I recommend using approach #1 due to the flexibility that the solution allows us. Once again, we can create rules for file copies according to the current state of the server that is performing the operation.

If the problem is not only related to the limit of the Google Cloud Storage API (1000 files simultaneously) but also to server resources such as CPU and memory, you could adopt a queue processing approach ([Pub/Sub](https://cloud.google.com/pubsub?)), thus creating an execution queue (with the list of files to be processed) and several servers could execute in parallel.

