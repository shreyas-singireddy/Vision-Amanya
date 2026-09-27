"use client";

/**
 * ResidenceComparison — Floating comparison drawer & side-by-side matrix.
 *
 * Subscribes to `usePropertyStore`'s `compareIds` state.
 * Allows comparing up to 3 Amnaya residences side-by-side:
 *   - Super Built-Up & Carpet Area
 *   - Floor Level & Tower Building
 *   - Facing Direction & View Orientation
 *   - Status & Enquiry Action
 */

import { useEffect, useState } from "react";
import { Scale, X, ArrowRight } from "lucide-react";
import Link from "next/link";

import { usePropertyStore } from "@store/property.store";
import { residenceService } from "@services/residence.service";
import type { Residence } from "@domain/residence";
import { routes } from "@constants/routes";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { Button } from "@components/ui/button";

export function ResidenceComparison() {
  const compareIds = usePropertyStore((state) => state.compareIds);
  const toggleCompare = usePropertyStore((state) => state.toggleCompare);
  const clearCompare = usePropertyStore((state) => state.clearCompare);

  const [comparedList, setComparedList] = useState<Residence[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (compareIds.length > 0) {
      residenceService.getForComparison(compareIds).then((res) => {
        if (isMounted) setComparedList(res);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [compareIds]);

  if (compareIds.length === 0) return null;

  return (
    <>
      {/* Floating Bottom Dock Bar */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-border bg-card/95 p-2 px-4 shadow-2xl backdrop-blur-xl text-foreground">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Scale className="h-4 w-4 text-accent-600 dark:text-accent-400" />
          <span>
            {compareIds.length} Residence{compareIds.length > 1 ? "s" : ""} in Compare
          </span>
        </div>

        <Button onClick={() => setIsOpen(true)} variant="accent" size="sm">
          Compare Matrix
        </Button>

        <button
          onClick={clearCompare}
          aria-label="Clear comparison list"
          className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Comparison Matrix Dialog Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="font-serif text-2xl">Residence Comparison</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Side-by-side comparison of selected Amnaya units
                </p>
              </div>
              <Button
                onClick={clearCompare}
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
              >
                Clear All
              </Button>
            </div>
          </DialogHeader>

          {/* Comparison Matrix Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground font-medium w-1/4">
                    Specification
                  </th>
                  {comparedList.map((res) => (
                    <th
                      key={res.id}
                      className="py-3 px-4 font-serif text-base font-semibold text-foreground"
                    >
                      <div className="flex items-center justify-between">
                        <span>{res.title}</span>
                        <button
                          onClick={() => toggleCompare(res.id)}
                          className="text-muted-foreground hover:text-foreground text-xs"
                          aria-label={`Remove ${res.title} from comparison`}
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-xs font-sans text-accent-600 dark:text-accent-400 font-normal mt-0.5">
                        {res.typology}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted-foreground">
                    Tower / Building
                  </td>
                  {comparedList.map((res) => (
                    <td key={res.id} className="py-3 px-4 font-medium">
                      {res.location.building}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted-foreground">Floor Level</td>
                  {comparedList.map((res) => (
                    <td key={res.id} className="py-3 px-4 font-medium">
                      {res.location.floor}th Floor
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted-foreground">
                    Super Built-Up Area
                  </td>
                  {comparedList.map((res) => (
                    <td key={res.id} className="py-3 px-4 numeric font-semibold">
                      {res.superBuiltUpAreaSqft.toLocaleString()} sq.ft.
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted-foreground">Carpet Area</td>
                  {comparedList.map((res) => (
                    <td key={res.id} className="py-3 px-4 numeric">
                      {res.carpetAreaSqft.toLocaleString()} sq.ft.
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted-foreground">
                    Orientation / View
                  </td>
                  {comparedList.map((res) => (
                    <td
                      key={res.id}
                      className="py-3 px-4 font-medium text-accent-600 dark:text-accent-400"
                    >
                      {res.location.view}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted-foreground">Facing</td>
                  {comparedList.map((res) => (
                    <td key={res.id} className="py-3 px-4">
                      {res.location.facing}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-muted-foreground">Action</td>
                  {comparedList.map((res) => (
                    <td key={res.id} className="py-3 px-4">
                      <Button asChild variant="outline" size="sm" className="w-full text-xs">
                        <Link href={routes.residenceDetail(res.id)}>
                          View Details <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
