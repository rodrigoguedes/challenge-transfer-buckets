import {spawn} from 'child_process';

export async function copyBucket(sourceBucket, destinationBucket) {
    const command = 'gsutil';

    const args = ['-m', 'cp', '-r', sourceBucket, destinationBucket];

    const chidProcess = spawn('gsutil', args, {
        stdio: ['pipe', 'inherit', 'inherit'],
      });

    await new Promise((resolve, reject) => {
        chidProcess.on('close', code => {
            const msg = `Execution of ${command} command ended with code ${code}`;

            if (code !== 0) {
                reject(msg);
                return;
            }

            resolve();
        });
    });
}

const argSrcBucketName = process.argv[2];
const argDestBucketName = process.argv[3];

if (!argSrcBucketName || !argDestBucketName) {
    console.error('Usage: node main.js <source-bucket-name> <destination-bucket-name>');
    process.exit(1);
}

copyBucket(`${argSrcBucketName}/*`, argDestBucketName).catch(err => {
    console.error('Error transferring files:', err);
});
