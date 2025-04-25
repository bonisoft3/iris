# syntax = devthefuture/dockerfile-x:v1.3.3@sha256:807e3b9a38aa29681f77e3ab54abaadb60e633dc5a5672940bb957613b4f9c82
FROM bufbuild/buf:1.27.1@sha256:609b03d4e1191b5f53adfa5965b3fcab8c22ceec4c61f8d0349b7c774b6a752f
ADD buf.work.yaml .
ADD libraries/xproto/buf.yaml libraries/xproto/buf.yaml
ADD libraries/xproto/buf.lock libraries/xproto/buf.lock
ADD libraries/xproto/trash libraries/xproto/trash
WORKDIR libraries/xproto
RUN buf mod update && buf build --as-file-descriptor-set --exclude-source-info  -o '/xproto.desc.pb#format=binpb' .
