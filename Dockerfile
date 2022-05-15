# 全局配置
FROM registry.cn-beijing.aliyuncs.com/zaoqiganfan/ganfan-web-base:0.0.2
RUN npm install pm2@5.2.0 -g

ADD package.json /package.json
ADD package-lock.json /package-lock.json

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
ADD . /ganfan-do-web
WORKDIR /ganfan-do-web


# 上传OSS的构建
RUN HOST=https://zaoqiganfan.oss-cn-beijing.aliyuncs.com/ \
PUBLIC_URL="https://zaoqiganfan.oss-cn-beijing.aliyuncs.com/ganfan-tech/web/do/prod/" \
npm run build:prod

RUN ossutil64
RUN ossutil64 cp -r dist oss://zaoqiganfan/ganfan-tech/web/do/prod/ --force
