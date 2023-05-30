FROM ruby:3.2
EXPOSE 4000

COPY . /docs
WORKDIR /docs

RUN bundle install

CMD bundle exec jekyll serve --config _config.yml,_config.docker.yml --force_polling -H 0.0.0.0 -P 4000
