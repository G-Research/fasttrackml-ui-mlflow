package main

import (
	"context"
	"log"
	"os"
	"path/filepath"

	"dagger.io/dagger"
)

func main() {
	src, err := filepath.Abs("../src")
	if err != nil {
		log.Fatalln(err)
	}
	dst, err := filepath.Abs("../embed")
	if err != nil {
		log.Fatalln(err)
	}

	ctx := context.Background()
	client, err := dagger.Connect(ctx, dagger.WithLogOutput(os.Stderr))
	if err != nil {
		log.Fatalln(err)
	}
	defer client.Close()

	if err := os.RemoveAll(dst); err != nil {
		log.Fatalln(err)
	}

	_, err = client.Pipeline("build").
		Container().
		From("node:16").
		WithDirectory("/src",
			client.Host().Directory(src, dagger.HostDirectoryOpts{
				Include: []string{"package.json", "yarn.lock", "yarn", "vendor", ".yarnrc.yml"},
			}),
		).
		WithWorkdir("/src").
		WithExec([]string{"yarn", "install", "--immutable"}).
		WithDirectory("/src",
			client.Host().Directory(src, dagger.HostDirectoryOpts{
				Exclude: []string{"node_modules", ".yarn"},
			}),
		).
		WithExec([]string{"yarn", "build"}).
		Directory("build").
		Export(ctx, dst)
	if err != nil {
		log.Fatalln(err)
	}
}
