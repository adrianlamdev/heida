import React, { useState } from "react";
import {
  GitBranch,
  GitPullRequest,
  Github,
  Plus,
  Search,
  History,
  FileCode,
  ChevronRight,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@workspace/ui/components/command";

const CommandMenu = ({ isOpen, onSelect, onClose }) => {
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [page, setPage] = useState("main"); // main, repo-select, repo-commands

  // Mock data - in real app, fetch from GitHub API
  const recentRepos = [
    { id: 1, name: "my-project", owner: "adrianlamdev" },
    { id: 2, name: "awesome-app", owner: "adrianlamdev" },
  ];

  const handleSelect = (action) => {
    if (action.type === "select-repo") {
      setSelectedRepo(action.repo);
      setPage("repo-commands");
    } else if (action.type === "back") {
      setPage("main");
      setSelectedRepo(null);
    } else {
      onSelect(action);
      onClose();
    }
  };

  const pages = {
    main: (
      <>
        <CommandGroup heading="GitHub">
          <CommandItem
            onSelect={() => setPage("repo-select")}
            className="gap-4"
          >
            <Plus className="h-4 w-4" />
            <div className="flex-1">
              <p>Link Repository</p>
              <p className="text-sm text-muted-foreground">
                Select a repository to analyze
              </p>
            </div>
            <ChevronRight className="ml-2 h-4 w-4" />
          </CommandItem>
        </CommandGroup>
      </>
    ),

    "repo-select": (
      <>
        <CommandGroup heading="Recent Repositories">
          {recentRepos.map((repo) => (
            <CommandItem
              key={repo.id}
              onSelect={() => handleSelect({ type: "select-repo", repo })}
            >
              <FileCode className="mr-2 h-4 w-4" />
              <div className="flex-1">
                <p>{repo.name}</p>
                <p className="text-sm text-muted-foreground">{repo.owner}</p>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => setPage("main")}>
            <Search className="mr-2 h-4 w-4" />
            <p>Search All Repositories...</p>
          </CommandItem>
        </CommandGroup>
      </>
    ),

    "repo-commands": (
      <>
        <CommandGroup heading={`${selectedRepo?.name || "Repository"} Actions`}>
          <CommandItem
            onSelect={() =>
              handleSelect({
                type: "analyze-code",
                repo: selectedRepo,
                template: `Analyze the code structure in ${selectedRepo?.name}: `,
              })
            }
          >
            <FileCode className="mr-2 h-4 w-4" />
            <div className="flex-1">
              <p>Analyze Code</p>
              <p className="text-sm text-muted-foreground">
                Review and analyze repository code
              </p>
            </div>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleSelect({
                type: "review-pr",
                repo: selectedRepo,
                template: `Review pull request in ${selectedRepo?.name}: `,
              })
            }
          >
            <GitPullRequest className="mr-2 h-4 w-4" />
            <div className="flex-1">
              <p>Review Pull Request</p>
              <p className="text-sm text-muted-foreground">
                Analyze and review PR changes
              </p>
            </div>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleSelect({
                type: "history",
                repo: selectedRepo,
                template: `Analyze the commit history of ${selectedRepo?.name}`,
              })
            }
          >
            <History className="mr-2 h-4 w-4" />
            <div className="flex-1">
              <p>View History</p>
              <p className="text-sm text-muted-foreground">
                Analyze commit history and changes
              </p>
            </div>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup>
          <CommandItem onSelect={() => setPage("main")}>
            <ChevronRight className="mr-2 h-4 w-4" />
            Switch Repository
          </CommandItem>
        </CommandGroup>
      </>
    ),
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput
        placeholder={
          page === "repo-select"
            ? "Search repositories..."
            : page === "repo-commands"
              ? `Search ${selectedRepo?.name || "repository"} commands...`
              : "Type a command or search..."
        }
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {pages[page]}
      </CommandList>
    </CommandDialog>
  );
};

export default CommandMenu;
