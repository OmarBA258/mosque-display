export default {
    electrobun: {
        version: "2.0.2"
    },
    scripts: {
        install: ["hutch", "install"],
        dev: ["hutch", "electrobun", "dev", "--watch"],
        build: ["hutch", "electrobun", "build", "--env=stable"]
    }
};