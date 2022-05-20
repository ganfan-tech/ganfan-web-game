# 全局配置
FROM registry.cn-beijing.aliyuncs.com/zaoqiganfan/ganfan-web-base:0.0.3

ADD package.json /ganfan-web/package.json
ADD package-lock.json /ganfan-web/package-lock.json

WORKDIR /ganfan-web
RUN npm install

# 设置变量
ARG OSS_ACCESSKEY_ID
ARG OSS_ACCESSKEY_SECRET

RUN echo "[Credentials]" >> ~/.ossutilconfig && \
echo "language=EN" >> ~/.ossutilconfig && \
echo "accessKeySecret=${OSS_ACCESSKEY_SECRET}" >> ~/.ossutilconfig   && \
echo "endpoint=https://oss-cn-beijing.aliyuncs.com" >> ~/.ossutilconfig && \
echo "accessKeyID=${OSS_ACCESSKEY_ID}" >> ~/.ossutilconfig

RUN cat ~/.ossutilconfig

# 项目目录
ADD . /ganfan-web
WORKDIR /ganfan-web

# 上传OSS的构建
RUN HOST=https://ganfan-tech.oss-cn-beijing.aliyuncs.com/ \
PUBLIC_URL="https://ganfan-tech.oss-cn-beijing.aliyuncs.com/web/game/main/" \
npm run build:prod

RUN ossutil64
RUN ossutil64 cp -r dist oss://ganfan-tech/web/game/main/ --force
RUN ossutil64 cp dist/index.html oss://ganfan-tech/web-html/game/main/index.html --force

RUN curl -X POST -H "Refresh-OSS: immediately" https://game.ganfan.tech/html/refresh
