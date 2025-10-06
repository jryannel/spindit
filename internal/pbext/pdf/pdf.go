package pdf

import "github.com/pocketbase/pocketbase/core"

const Version = "v0.30"

// Register attaches the PDF generation extension to the PocketBase app.
// The actual template rendering will be completed in later milestones.
func Register(app core.App) error {
	_ = app
	return nil
}
