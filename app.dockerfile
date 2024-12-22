FROM node:20.18.0-alpine

ARG NEXT_PUBLIC_WS_URL=ws://127.0.0.1:3001
ARG NEXT_PUBLIC_API_URL=http://127.0.0.1:3001/api
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}



WORKDIR /home/perplexica

COPY ui /home/perplexica/

# 设置 Yarn 的国内镜像源（全局配置）
RUN yarn config set registry https://registry.npmmirror.com/

# 检查配置是否成功
RUN yarn config get registry

# 删除锁文件并重新生成，确保地址更新
RUN rm -f yarn.lock

# 强制使用指定镜像源进行安装
RUN yarn install --registry https://registry.npmmirror.com/ --frozen-lockfile --network-timeout 600000 --verbose

# 安装依赖并构建
# RUN yarn config set registry $YARN_REGISTRY && \
#     yarn install --frozen-lockfile && \
#     yarn build

RUN yarn build

CMD ["yarn", "start"]
