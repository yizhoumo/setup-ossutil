# setup-ossutil

[![GitHub Actions status](https://github.com/yizhoumo/setup-ossutil/workflows/build-test/badge.svg)](https://github.com/yizhoumo/setup-ossutil/actions)

This action sets up [Alibaba Cloud OSSUTIL](https://github.com/aliyun/ossutil) for use in actions by:

- downloading and caching ossutil by version and adding to PATH
- configuring ossutil with your credentials

## Usage

See [action.yml](action.yml)

```yaml
steps:
- uses: actions/checkout@v1
- uses: yizhoumo/setup-ossutil@v1
  with:
    ossutil-version: '1.7.0' # Optional, default to '1.7.0'
    endpoint: ${{ secrets.OSS_ENDPOINT }}
    access-key-id: ${{ secrets.OSS_ACCESS_KEY_ID }}
    access-key-secret: ${{ secrets.OSS_ACCESS_KEY_SECRET }}
- run: ossutil cp -f file-to-upload.txt oss://your-bucket/path
```

See also: [Document of ossutil](https://help.aliyun.com/document_detail/50452.html)

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
