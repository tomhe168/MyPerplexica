FROM node:18-slim

WORKDIR /home/perplexica

# 复制必要的文件
COPY src /home/perplexica/src
COPY tsconfig.json /home/perplexica/
COPY drizzle.config.ts /home/perplexica/
COPY package.json /home/perplexica/
COPY yarn.lock /home/perplexica/

# 创建所需的目录
RUN mkdir /home/perplexica/data
RUN mkdir /home/perplexica/uploads

# 生成并替换 /etc/apt/sources.list 为国内阿里云镜像
RUN echo "deb http://mirrors.aliyun.com/debian/ bookworm main" > /etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/debian-security/ bookworm-security main" >> /etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/debian/ bookworm-updates main" >> /etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/debian/ bookworm-backports main" >> /etc/apt/sources.list   

# 安装必要的依赖，包括 pkg-config
RUN apt-get update && apt-get install -y \
    python3 \
    python3-distutils \
    build-essential \
    make \
    gcc \
    g++ \
    pkg-config \
    libglib2.0-dev \
    libjpeg-dev \
    libpng-dev \
    libwebp-dev \
    libtiff-dev \
    zlib1g-dev \
    libexpat1-dev \
    libfreetype6-dev \
    libfontconfig1-dev \
    libgdk-pixbuf2.0-dev \
    libpango1.0-dev \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# # 验证 glib-object.h 是否存在
# RUN find /usr/include -name 'glib-object.h'

# # 验证 pkg-config 能找到 glib-2.0
# RUN pkg-config --cflags glib-2.0

# 设置 Python 环境变量
RUN ln -s /usr/bin/python3 /usr/bin/python
ENV PYTHON=/usr/bin/python3

# 配置 sharp 的二进制主机
RUN echo "sharp_binary_host=https://registry.npmmirror.com/-/binary/sharp" >> .npmrc && \
    echo "sharp_libvips_binary_host=https://registry.npmmirror.com/-/binary/sharp-libvips" >> .npmrc



# 检查配置是否成功
RUN yarn config get registry

# 删除锁文件并重新生成，确保地址更新
RUN rm -f yarn.lock

# 清理 yarn 缓存
RUN yarn cache clean --force

# 强制使用指定镜像源进行安装
RUN yarn install --registry https://registry.npmmirror.com/ --frozen-lockfile --network-timeout 600000 --verbose

# 检查 libvips 版本
# RUN vips --version

# 检查 sharp 是否正确安装并使用系统 libvips
# RUN node -e "const sharp = require('sharp'); console.log('sharp libvips version:', sharp.libvipsVersion)"

# 构建项目
RUN yarn build

# 启动命令
CMD ["yarn", "start"]

