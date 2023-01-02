# setup-coscli

[![build](https://github.com/git9527/setup-coscli/actions/workflows/build.yml/badge.svg)](https://github.com/git9527/setup-coscli/actions/workflows/build.yml)
[![test](https://github.com/git9527/setup-coscli/actions/workflows/test.yml/badge.svg)](https://github.com/git9527/setup-coscli/actions/workflows/test.yml)

This action sets up [Tencent Cloud COSCLI](https://cloud.tencent.com/document/product/436/63144) for use in actions by:

- downloading and caching coscli by version and adding to PATH
- configuring coscli with your credentials

## Usage

See [action.yml](action.yml)

```yaml
steps:
- uses: actions/checkout@v1
- uses: git9527/setup-coscli@v1
  with:
    region: ${{ secrets.COS_REGION }}
    secret-id: ${{ secrets.COS_SECRET_ID }}
    secret-key: ${{ secrets.COS_SECRET_KEY }}
    session-token: ${{ secrets.COS_TOKEN }}
    coscli-version: 'v0.12.0-beta' # Optional, default to 'v0.12.0-beta'.  Use 'latest' to get the latest version.
- run: coscli sync ~/example.txt cos://bucket1/example.txt
```

See also: [Document of coscli](https://cloud.tencent.com/document/product/436/63143)

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
