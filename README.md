# setup-ossutil

[![Continuous Integration](https://github.com/yizhoumo/setup-ossutil/actions/workflows/ci.yml/badge.svg)](https://github.com/yizhoumo/setup-ossutil/actions/workflows/ci.yml)
[![Functional](https://github.com/yizhoumo/setup-ossutil/actions/workflows/functional.yml/badge.svg)](https://github.com/yizhoumo/setup-ossutil/actions/workflows/functional.yml)

This action provides the following functionality for GitHub Actions users:

- Downloading and caching distribution of the requested [Alibaba Cloud OSSUTIL](https://github.com/aliyun/ossutil)
  version, and adding it to the PATH
- Optionally configuring ossutil with the provided credential

## Usage

See [action.yml](action.yml)

```yaml
steps:
- uses: yizhoumo/setup-ossutil@v2
  with:
    ## The version to download and use, or 'latest' for the latest version.
    ossutil-version: '1.7.18'

    # The following parameters are (optionally) used to config the credential.
    ## The endpoint of the region in which the bucket is located.
    endpoint: ${{ secrets.OSS_ENDPOINT }}
    ## The AccessKey ID of the credential.
    access-key-id: ${{ secrets.OSS_ACCESS_KEY_ID }}
    ## The AccessKey Secret of the credential.
    access-key-secret: ${{ secrets.OSS_ACCESS_KEY_SECRET }}
    ## The STS Token of the credential. Only required for temporary access.
    sts-token: ${{ secrets.OSS_STS_TOKEN }}

- run: ossutil cp -f file-to-upload.txt oss://your-bucket/path
```

See also: [Document of ossutil](https://help.aliyun.com/document_detail/50452.html)

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
