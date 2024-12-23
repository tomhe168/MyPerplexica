# 使用更高版本的 Node.js 镜像
FROM node:18-bullseye

# 配置阿里云镜像源
RUN echo "deb http://mirrors.aliyun.com/debian/ bullseye main" > /etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/debian-security/ bullseye-security main" >> /etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/debian/ bullseye-updates main" >> /etc/apt/sources.list && \
    echo "deb http://mirrors.aliyun.com/debian/ bullseye-backports main" >> /etc/apt/sources.list

# 安装 canvas 和 sharp 的系统依赖
RUN apt-get update -y && apt-get install -y \
    libcrypt1 \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libvips-dev \
    && ln -s /usr/lib/x86_64-linux-gnu/libcrypt.so.1 /lib/libcrypt.so.1 \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 配置 npm 使用淘宝镜像源
RUN yarn config set registry https://registry.npmmirror.com

# 删除锁文件并清理缓存，确保使用指定源
RUN rm -f yarn.lock && yarn cache clean --force

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN yarn install --frozen-lockfile --network-timeout 600000 --verbose

# 复制项目代码
COPY . .

# 构建项目
RUN yarn build || echo "Build failed, continuing with logs..."

# 创建用于存储图像的目录
RUN mkdir -p images

# 暴露应用程序端口
EXPOSE 5000

# 启动命令
CMD ["yarn", "start"]
